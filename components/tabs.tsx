'use client'

import { useState, type ReactNode } from 'react'

import { cn } from '@/lib/utils'

export interface TabItem {
  id: string
  label: string
  content: ReactNode
}

// Abas genéricas. O conteúdo de cada aba é montado pela página (no servidor)
// e chega aqui pronto; este componente só decide qual aba mostrar.
export function Tabs({ items }: { items: TabItem[] }) {
  const [activeId, setActiveId] = useState(items[0].id)
  const active = items.find((item) => item.id === activeId) ?? items[0]

  return (
    <div>
      <div role="tablist" aria-label="Seções do processo" className="flex gap-1 overflow-x-auto border-b border-border">
        {items.map((item) => {
          const selected = item.id === active.id
          return (
            <button
              key={item.id}
              role="tab"
              id={`tab-${item.id}`}
              aria-selected={selected}
              aria-controls={`panel-${item.id}`}
              onClick={() => setActiveId(item.id)}
              className={cn(
                '-mb-px whitespace-nowrap border-b-2 px-4 py-3 text-[13px] transition-colors',
                selected
                  ? 'border-primary font-medium text-primary'
                  : 'border-transparent text-muted-foreground hover:text-primary',
              )}
            >
              {item.label}
            </button>
          )
        })}
      </div>

      <div role="tabpanel" id={`panel-${active.id}`} aria-labelledby={`tab-${active.id}`} className="pt-6">
        {active.content}
      </div>
    </div>
  )
}
