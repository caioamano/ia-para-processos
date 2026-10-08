'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

import { FilterSelect } from '@/components/filter-select'
import { Pagination } from '@/components/pagination'
import { ProcessesTable } from '@/components/processes-table'
import { SearchInput } from '@/components/search-input'
import { usePagination } from '@/lib/use-pagination'
import { PROCESS_STATUSES, PROCESS_TYPES } from '@/lib/types'
import type { Process, ProcessStatus, ProcessType } from '@/lib/types'

// Lista completa: busca + filtros + paginação.
// Tudo acontece no navegador, sobre a lista que a página entrega.
// Quando houver Supabase (Fase 7), a mesma tela passa a buscar página por página no banco.
export function ProcessList({ processes }: { processes: Process[] }) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<ProcessStatus | ''>('')
  const [type, setType] = useState<ProcessType | ''>('')

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

  const { page, setPage, totalPages, start, visible } = usePagination(filtered)
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
        <SearchInput
          value={query}
          onChange={(value) => {
            setQuery(value)
            setPage(1)
          }}
          placeholder="Buscar por número, cliente ou responsável"
        />

        <div className="flex flex-wrap items-center gap-2">
          <FilterSelect
            label="Filtrar por status"
            allLabel="Todos os status"
            value={status}
            options={PROCESS_STATUSES}
            onChange={(value) => {
              setStatus(value)
              setPage(1)
            }}
          />
          <FilterSelect
            label="Filtrar por tipo"
            allLabel="Todos os tipos"
            value={type}
            options={PROCESS_TYPES}
            onChange={(value) => {
              setType(value)
              setPage(1)
            }}
          />
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

      <Pagination
        page={page}
        totalPages={totalPages}
        start={start}
        shown={visible.length}
        total={filtered.length}
        noun="processos"
        onPageChange={setPage}
      />
    </section>
  )
}
