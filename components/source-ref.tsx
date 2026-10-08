import { FileText } from 'lucide-react'

import type { SourceReference } from '@/lib/types'

// Indica de onde veio uma informação. Usado na análise, no resumo e nas respostas da consulta.
export function SourceRef({ source }: { source: SourceReference }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted px-2 py-1 text-[11px] text-muted-foreground">
      <FileText className="size-3 text-olive" strokeWidth={1.8} />
      Fonte: {source.document} — página {source.page}
    </span>
  )
}
