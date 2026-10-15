import { ExternalLink, FileText } from 'lucide-react'

import type { SourceReference } from '@/lib/types'

// Indica de onde veio uma informação. Usado na análise, no resumo e nas respostas da consulta.
// Com `documentId`, vira um link que abre o PDF na página citada (em outra aba).
export function SourceRef({ source }: { source: SourceReference }) {
  const className =
    'inline-flex items-center gap-1.5 rounded-md border border-border bg-muted px-2 py-1 text-[11px] text-muted-foreground'
  const label = `Fonte: ${source.document} — página ${source.page}`

  if (!source.documentId) {
    return (
      <span className={className}>
        <FileText className="size-3 text-olive" strokeWidth={1.8} />
        {label}
      </span>
    )
  }

  return (
    <a
      href={`/documentos/${source.documentId}/arquivo?pagina=${source.page}`}
      target="_blank"
      rel="noopener noreferrer"
      title="Abrir o PDF nesta página"
      className={`${className} transition-colors hover:border-olive hover:text-foreground`}
    >
      <FileText className="size-3 text-olive" strokeWidth={1.8} />
      {label}
      <ExternalLink className="size-3" strokeWidth={1.8} />
    </a>
  )
}
