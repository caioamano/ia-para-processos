'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

import { analyzeDocumentPart, startDocumentAnalysis } from '@/app/(app)/processos/[id]/analise-actions'
import { ANALYSIS_MAX_PAGES } from '@/lib/document-analysis'
import type { DocumentStatus } from '@/lib/types'

interface AnalyzeDocumentButtonProps {
  documentId: string
  pages: number
  status: DocumentStatus
}

// Botão "Analisar" de um documento. Chama as ações do servidor em sequência: primeiro prepara,
// depois uma parte de 10 páginas por vez (com o progresso na tela) e, no fim, atualiza a página.
export function AnalyzeDocumentButton({ documentId, pages, status }: AnalyzeDocumentButtonProps) {
  const router = useRouter()
  const [progress, setProgress] = useState<{ part: number; parts: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const tooBig = pages > ANALYSIS_MAX_PAGES
  const running = progress !== null
  // "Em processamento" sem estar rodando aqui = análise interrompida (aba fechada, por exemplo).
  const label = status === 'Analisado' ? 'Analisar de novo' : status === 'Em processamento' ? 'Refazer análise' : 'Analisar'

  async function run() {
    setError(null)
    const started = await startDocumentAnalysis(documentId)
    if (!started.ok) {
      setError(started.error)
      return
    }

    for (let part = 0; part < started.parts; part++) {
      setProgress({ part: part + 1, parts: started.parts })
      const result = await analyzeDocumentPart(documentId, part)
      if (!result.ok) {
        setProgress(null)
        setError(result.error)
        router.refresh()
        return
      }
    }

    setProgress(null)
    router.refresh()
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={() => void run()}
        disabled={running || tooBig}
        title={tooBig ? `Por enquanto a análise aceita até ${ANALYSIS_MAX_PAGES} páginas.` : undefined}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-link hover:underline disabled:cursor-not-allowed disabled:opacity-50 disabled:no-underline"
      >
        {running && <Loader2 className="size-3 animate-spin" />}
        {running ? `Analisando… parte ${progress.part} de ${progress.parts}` : label}
      </button>
      {error && (
        <span role="alert" className="max-w-56 text-[11px] leading-4 text-destructive">
          {error}
        </span>
      )}
    </div>
  )
}
