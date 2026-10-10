'use client'

import { useRef, useState } from 'react'
import { Check, FileText, Loader2 } from 'lucide-react'

import { readDraftPdf } from '@/app/(app)/processos/novo/pdf-actions'
import { NewProcessForm } from '@/components/processes/new-process-form'
import { looksLikePdf, MAX_FILE_BYTES } from '@/lib/documents'
import { buildPrefill, draftStoragePath, type Prefill } from '@/lib/process-prefill'
import { createClient } from '@/lib/supabase/client'

interface NewProcessFlowProps {
  members: Array<{ id: string; name: string; role: string }>
  currentUserId: string
  today: string
  officeId: string
}

type Phase = 'idle' | 'sending' | 'reading' | 'ready' | 'error'

// Tela "Novo processo" com a opção de preencher a partir de um PDF. Ordem:
// 1) confere o arquivo no navegador (PDF? cabe em 50 MB?);
// 2) envia direto ao Storage, na pasta de RASCUNHOS do escritório (o processo ainda não existe);
// 3) o servidor lê o PDF com o Gemini e devolve os campos;
// 4) o formulário aparece preenchido (com a página de onde saiu cada dado) e o advogado confere;
// 5) ao cadastrar, o servidor anexa o PDF ao processo novo e apaga o rascunho.
// O formulário também funciona sem PDF, exatamente como antes.
export function NewProcessFlow({ members, currentUserId, today, officeId }: NewProcessFlowProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [phase, setPhase] = useState<Phase>('idle')
  const [message, setMessage] = useState<string | null>(null)
  const [fileName, setFileName] = useState('')
  const [prefill, setPrefill] = useState<Prefill | undefined>()
  const [draft, setDraft] = useState<{ id: string; fileName: string } | undefined>()
  const [pagesInfo, setPagesInfo] = useState<{ sent: number; total: number } | null>(null)
  const [formKey, setFormKey] = useState(0)

  const busy = phase === 'sending' || phase === 'reading'

  async function handleFile(file: File) {
    setMessage(null)
    if (file.size === 0) return fail('Arquivo vazio.')
    if (file.size > MAX_FILE_BYTES) return fail('O arquivo passa de 50 MB.')
    if (!looksLikePdf(new Uint8Array(await file.slice(0, 1024).arrayBuffer()))) return fail('Este arquivo não é um PDF.')

    const supabase = createClient()
    // Trocou de PDF: apaga o rascunho anterior (melhor esforço).
    if (draft) void supabase.storage.from('documents').remove([draftStoragePath(officeId, draft.id)])

    const draftId = crypto.randomUUID()
    setFileName(file.name)
    setPhase('sending')
    const { error } = await supabase.storage
      .from('documents')
      .upload(draftStoragePath(officeId, draftId), file, { contentType: 'application/pdf', upsert: false })
    if (error) return fail('Falha no envio. Tente novamente.')

    setPhase('reading')
    const result = await readDraftPdf(draftId)
    if (!result.ok) {
      void supabase.storage.from('documents').remove([draftStoragePath(officeId, draftId)])
      setDraft(undefined)
      setPrefill(undefined)
      setFormKey((key) => key + 1)
      return fail(result.error)
    }

    setPrefill(buildPrefill(result.extraction))
    setDraft({ id: draftId, fileName: file.name })
    setPagesInfo({ sent: result.pagesSent, total: result.totalPages })
    setFormKey((key) => key + 1) // recria o formulário para ele nascer com os valores lidos
    setPhase('ready')
  }

  function fail(text: string) {
    setMessage(text)
    setPhase('error')
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-start gap-3">
          <FileText className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold text-foreground">Preencher a partir de um PDF</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Envie a petição inicial ou o processo. A leitura automática sugere número, juízo, valor, datas e partes; você confere tudo antes
              de cadastrar. O PDF é enviado ao Gemini para a leitura.
            </p>

            <input
              ref={inputRef}
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0]
                event.target.value = '' // permite escolher o mesmo arquivo de novo depois
                if (file) void handleFile(file)
              }}
            />

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={busy}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-input bg-card px-3.5 text-xs font-medium text-primary transition-colors hover:bg-accent disabled:opacity-50"
              >
                {phase === 'ready' ? 'Trocar PDF' : 'Escolher PDF'}
              </button>

              {busy && (
                <span className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="size-3.5 animate-spin" />
                  {phase === 'sending' ? 'Enviando o arquivo…' : 'Lendo o documento (pode levar até 1 minuto)…'}
                </span>
              )}
              {phase === 'ready' && (
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Check className="size-3.5" />
                  {fileName}
                  {pagesInfo && ` · ${pagesInfo.sent < pagesInfo.total ? `lidas as primeiras ${pagesInfo.sent} de ${pagesInfo.total} páginas` : `${pagesInfo.total} página${pagesInfo.total === 1 ? '' : 's'}`}`}
                </span>
              )}
            </div>

            {message && (
              <p role="alert" className="mt-3 text-xs text-destructive">
                {message} Você pode tentar de novo ou preencher o formulário abaixo manualmente.
              </p>
            )}
          </div>
        </div>
      </div>

      <NewProcessForm key={formKey} members={members} currentUserId={currentUserId} today={today} prefill={prefill} draft={draft} />
    </div>
  )
}
