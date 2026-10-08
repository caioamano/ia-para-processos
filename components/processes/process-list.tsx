'use client'

import { useState } from 'react'
import { Search, X } from 'lucide-react'

import { ProcessesTable } from '@/components/processes-table'
import { PROCESS_STATUSES, PROCESS_TYPES } from '@/lib/types'
import type { Process, ProcessStatus, ProcessType } from '@/lib/types'

const PAGE_SIZE = 10

const selectClass =
  'h-8 rounded-md border border-input bg-muted px-2.5 text-xs text-foreground outline-none focus:border-olive'

// Lista completa: busca + filtros + paginação.
// Tudo acontece no navegador, sobre a lista que a página entrega.
// Quando houver Supabase (Fase 7), a mesma tela passa a buscar página por página no banco.
export function ProcessList({ processes }: { processes: Process[] }) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<ProcessStatus | ''>('')
  const [type, setType] = useState<ProcessType | ''>('')
  const [page, setPage] = useState(1)

  const search = query.trim().toLowerCase()
  const filtered = processes.filter((process) => {
    const matchesSearch =
      search === '' ||
      [process.number, process.client, process.responsible].some((value) =>
        value.toLowerCase().includes(search),
      )
    const matchesStatus = status === '' || process.status === status
    const matchesType = type === '' || process.type === type
    return matchesSearch && matchesStatus && matchesType
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const start = (currentPage - 1) * PAGE_SIZE
  const visible = filtered.slice(start, start + PAGE_SIZE)

  const hasFilters = query !== '' || status !== '' || type !== ''

  function clearFilters() {
    setQuery('')
    setStatus('')
    setType('')
    setPage(1)
  }

  return (
    <section className="mt-8 rounded-lg border border-border bg-card">
      <div className="flex flex-col gap-3 border-b border-line px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-subtle" />
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setPage(1)
            }}
            placeholder="Buscar por número, cliente ou responsável"
            className="h-8 w-full rounded-md border border-input bg-muted pl-9 pr-3 text-xs outline-none placeholder:text-subtle focus:border-olive lg:w-[320px]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Filtrar por status"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as ProcessStatus | '')
              setPage(1)
            }}
            className={selectClass}
          >
            <option value="">Todos os status</option>
            {PROCESS_STATUSES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <select
            aria-label="Filtrar por tipo"
            value={type}
            onChange={(event) => {
              setType(event.target.value as ProcessType | '')
              setPage(1)
            }}
            className={selectClass}
          >
            <option value="">Todos os tipos</option>
            {PROCESS_TYPES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium text-link hover:underline"
            >
              <X className="size-3.5" /> Limpar filtros
            </button>
          )}
        </div>
      </div>

      <ProcessesTable processes={visible} />

      <div className="flex flex-col gap-3 border-t border-line px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-xs text-subtle">
          {filtered.length === 0
            ? 'Nenhum resultado'
            : `Exibindo ${start + 1}–${start + visible.length} de ${filtered.length} processos`}
        </span>

        <div className="flex items-center gap-3">
          <span className="text-xs text-subtle">
            Página {currentPage} de {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-8 rounded-md border border-input px-3 text-xs font-medium text-muted-foreground hover:bg-accent disabled:pointer-events-none disabled:opacity-40"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-8 rounded-md border border-input px-3 text-xs font-medium text-muted-foreground hover:bg-accent disabled:pointer-events-none disabled:opacity-40"
            >
              Próxima
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
