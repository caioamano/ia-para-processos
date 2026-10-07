import type { ReactNode } from 'react'

interface PageHeaderProps {
  eyebrow: string
  title: string
  description: string
  action?: ReactNode
}

// Cabeçalho padrão de todas as telas: etiqueta, título, descrição e (opcional) um botão.
export function PageHeader({ eyebrow, title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-olive">{eyebrow}</p>
        <h1 className="text-[28px] font-semibold tracking-[-0.04em] text-primary">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  )
}
