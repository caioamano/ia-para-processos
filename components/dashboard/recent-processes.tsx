'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, SlidersHorizontal } from 'lucide-react'

import { ProcessesTable } from '@/components/processes-table'
import type { Process } from '@/lib/types'

interface RecentProcessesProps {
  processes: Process[]
  total: number
}

// É um componente de cliente ('use client') porque a busca guarda o texto digitado em useState.
export function RecentProcesses({ processes, total }: RecentProcessesProps) {
  const [query, setQuery] = useState('')

  const search = query.trim().toLowerCase()
  const filtered = processes.filter((process) =>
    [process.number, process.client, process.type, process.responsible, process.status].some((value) =>
      value.toLowerCase().includes(search),
    ),
  )

  return (
    <section className="mt-8 rounded-lg border border-border bg-card">
      <div className="flex flex-col gap-4 border-b border-line px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[15px] font-semibold text-foreground">Processos recentes</h2>
          <p className="mt-1 text-xs text-subtle">Acompanhe as últimas movimentações do escritório.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-subtle" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar processo"
              className="h-8 w-full rounded-md border border-input bg-muted pl-9 pr-3 text-xs outline-none placeholder:text-subtle focus:border-olive sm:w-[190px]"
            />
          </div>
          <Link
            href="/processos"
            aria-label="Filtrar processos"
            className="flex size-8 items-center justify-center rounded-md border border-input text-muted-foreground hover:bg-accent"
          >
            <SlidersHorizontal className="size-3.5" />
          </Link>
        </div>
      </div>

      <ProcessesTable processes={filtered} />

      <div className="flex items-center justify-between border-t border-line px-5 py-3">
        <span className="text-xs text-subtle">
          Exibindo {filtered.length} de {total} processos
        </span>
        <Link href="/processos" className="text-xs font-medium text-link hover:underline">
          Ver todos os processos
        </Link>
      </div>
    </section>
  )
}
