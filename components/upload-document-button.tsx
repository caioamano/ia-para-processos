'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Loader2, Upload, X } from 'lucide-react'

import { registerDocument } from '@/app/(app)/processos/[id]/documentos-actions'
import { Button } from '@/components/ui/button'
import { documentStoragePath, looksLikePdf, MAX_FILE_BYTES } from '@/lib/documents'
import { createClient } from '@/lib/supabase/client'

type ItemState = 'waiting' | 'sending' | 'checking' | 'done' | 'error'

interface UploadItem {
  key: string
  name: string
  state: ItemState
  message?: string
}

const STATE_LABEL: Record<ItemState, string> = {
  waiting: 'Aguardando',
  sending: 'Enviando…',
  checking: 'Lendo o PDF…',
  done: 'Enviado',
  error: 'Erro',
}

// Botão "Enviar documento" + janela de envio. Ordem para cada arquivo:
// 1) confere no navegador (é PDF? cabe em 50 MB?);
// 2) envia direto para o Storage, na pasta do escritório;
// 3) pede ao servidor para conferir de verdade e registrar o documento.
export function UploadDocumentButton({ officeId, processId }: { officeId: string; processId: string }) {
  const router = useRouter()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [items, setItems] = useState<UploadItem[]>([])
  const [busy, setBusy] = useState(false)

  function update(key: string, patch: Partial<UploadItem>) {
    setItems((current) => current.map((item) => (item.key === key ? { ...item, ...patch } : item)))
  }

  async function sendFile(file: File, key: string) {
    if (file.size === 0) return update(key, { state: 'error', message: 'Arquivo vazio.' })
    if (file.size > MAX_FILE_BYTES) return update(key, { state: 'error', message: 'Passa de 50 MB.' })
    const head = new Uint8Array(await file.slice(0, 1024).arrayBuffer())
    if (!looksLikePdf(head)) return update(key, { state: 'error', message: 'Não é um PDF.' })

    const documentId = crypto.randomUUID()
    const path = documentStoragePath(officeId, processId, documentId)

    update(key, { state: 'sending' })
    const { error } = await createClient()
      .storage.from('documents')
      .upload(path, file, { contentType: 'application/pdf', upsert: false })
    if (error) return update(key, { state: 'error', message: 'Falha no envio. Tente novamente.' })

    update(key, { state: 'checking' })
    const result = await registerDocument(processId, documentId, file.name)
    if (result.ok) update(key, { state: 'done' })
    else update(key, { state: 'error', message: result.error })
  }

  async function handleFiles(files: File[]) {
    if (files.length === 0) return
    const queued = files.map((file, index) => ({ file, key: `${Date.now()}-${index}` }))
    setItems(queued.map(({ file, key }) => ({ key, name: file.name, state: 'waiting' as ItemState })))
    setBusy(true)
    for (const { file, key } of queued) {
      try {
        await sendFile(file, key)
      } catch {
        update(key, { state: 'error', message: 'Falha inesperada. Tente novamente.' })
      }
    }
    setBusy(false)
    router.refresh() // recarrega a lista de documentos com o que acabou de entrar
  }

  function open() {
    setItems([])
    dialogRef.current?.showModal()
  }

  function close() {
    if (!busy) dialogRef.current?.close()
  }

  return (
    <>
      <button
        onClick={open}
        className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-input bg-card px-3.5 text-xs font-medium text-primary transition-colors hover:bg-accent"
      >
        <Upload className="size-4" /> Enviar documento
      </button>

      <dialog
        ref={dialogRef}
        onCancel={(event) => busy && event.preventDefault()}
        className="m-auto w-[min(560px,92vw)] rounded-xl border border-border bg-card p-0 text-foreground backdrop:bg-black/40"
      >
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-foreground">Enviar documentos</h2>
              <p className="mt-1 text-sm text-muted-foreground">PDF de até 50 MB. Você pode escolher vários arquivos.</p>
            </div>
            <button onClick={close} disabled={busy} aria-label="Fechar" className="text-muted-foreground hover:text-primary disabled:opacity-40">
              <X className="size-5" />
            </button>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            multiple
            className="hidden"
            onChange={(event) => {
              const files = Array.from(event.target.files ?? [])
              event.target.value = '' // permite escolher o mesmo arquivo de novo depois
              void handleFiles(files)
            }}
          />

          <Button onClick={() => inputRef.current?.click()} disabled={busy} size="lg" className="mt-5 h-10 px-5">
            {busy ? 'Enviando…' : 'Escolher arquivos'}
          </Button>

          {items.length > 0 && (
            <ul className="mt-5 divide-y divide-line rounded-lg border border-border">
              {items.map((item) => (
                <li key={item.key} className="flex items-center justify-between gap-3 px-4 py-3 text-[13px]">
                  <span className="min-w-0 truncate text-foreground">{item.name}</span>
                  <span
                    className={`flex shrink-0 items-center gap-1.5 text-xs ${item.state === 'error' ? 'text-destructive' : 'text-muted-foreground'}`}
                  >
                    {(item.state === 'sending' || item.state === 'checking') && <Loader2 className="size-3.5 animate-spin" />}
                    {item.state === 'done' && <Check className="size-3.5" />}
                    {item.state === 'error' ? item.message : STATE_LABEL[item.state]}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-6 flex justify-end">
            <button onClick={close} disabled={busy} className="text-sm font-medium text-muted-foreground hover:text-primary disabled:opacity-40">
              Fechar
            </button>
          </div>
        </div>
      </dialog>
    </>
  )
}
