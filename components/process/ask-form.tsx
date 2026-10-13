'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

import { askAboutProcess } from '@/app/(app)/processos/[id]/consulta-actions'
import { QA_MAX_QUESTION } from '@/lib/process-qa'

interface AskFormProps {
  processId: string
  // Só dá para perguntar se o processo tem pelo menos um documento com arquivo.
  hasDocuments: boolean
}

export function AskForm({ processId, hasDocuments }: AskFormProps) {
  const router = useRouter()
  const [question, setQuestion] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [note, setNote] = useState<string | null>(null)

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending || question.trim() === '') return
    setPending(true)
    setError(null)
    setNote(null)

    const result = await askAboutProcess(processId, question)
    setPending(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setQuestion('')
    if (result.skipped.length > 0) {
      setNote(`Não entraram na consulta por tamanho: ${result.skipped.join(', ')}.`)
    }
    router.refresh() // recarrega o histórico com a resposta nova
  }

  return (
    <form onSubmit={submit} className="mt-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          disabled={pending || !hasDocuments}
          maxLength={QA_MAX_QUESTION}
          placeholder="Ex.: Qual é o valor da causa?"
          aria-label="Pergunta sobre o processo"
          className="h-9 flex-1 rounded-md border border-input bg-card px-3 text-xs outline-none placeholder:text-subtle focus-visible:border-ring disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-70"
        />
        <button
          type="submit"
          disabled={pending || !hasDocuments || question.trim() === ''}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 text-xs font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40"
        >
          {pending && <Loader2 className="size-3.5 animate-spin" />}
          {pending ? 'Consultando…' : 'Consultar'}
        </button>
      </div>
      {!hasDocuments && (
        <p className="mt-2 text-[11px] text-subtle">Envie um PDF na aba Documentos para poder consultar este processo.</p>
      )}
      {pending && <p className="mt-2 text-[11px] text-subtle">Lendo os documentos (pode levar até 1 minuto)…</p>}
      {error && (
        <p role="alert" className="mt-2 text-xs text-destructive">
          {error}
        </p>
      )}
      {note && <p className="mt-2 text-[11px] text-subtle">{note}</p>}
    </form>
  )
}
