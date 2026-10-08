'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MoreHorizontal, Search, SlidersHorizontal } from 'lucide-react'

import { StatusBadge } from '@/components/status-badge'
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
          <button
            aria-label="Filtrar processos"
            className="flex size-8 items-center justify-center rounded-md border border-input text-muted-foreground hover:bg-accent"
          >
            <SlidersHorizontal className="size-3.5" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-left">
          <thead className="bg-muted">
            <tr className="border-b border-line text-[10px] font-semibold uppercase tracking-[0.1em] text-subtle">
              <th className="px-5 py-3 font-medium">Número</th>
              <th className="px-4 py-3 font-medium">Cliente</th>
              <th className="px-4 py-3 font-medium">Tipo</th>
              <th className="px-4 py-3 font-medium">Responsável</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Atualização</th>
              <th className="px-3 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((process) => (
              <tr
                key={process.id}
                className="border-b border-line text-[13px] last:border-0 hover:bg-muted"
              >
                <td className="px-5 py-4 font-medium text-link">{process.number}</td>
                <td className="px-4 py-4 text-foreground">{process.client}</td>
                <td className="px-4 py-4 text-muted-foreground">{process.type}</td>
                <td className="px-4 py-4 text-muted-foreground">{process.responsible}</td>
                <td className="px-4 py-4">
                  <StatusBadge status={process.status} />
                </td>
                <td className="px-4 py-4 text-subtle">{process.updatedAt}</td>
                <td className="px-3 py-4">
                  <button
                    aria-label={`Mais opções para ${process.number}`}
                    className="text-subtle hover:text-primary"
                  >
                    <MoreHorizontal className="size-4" />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-sm text-subtle">
                  Nenhum processo encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
