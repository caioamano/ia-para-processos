'use client'

import { useState } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'

import { FilterSelect } from '@/components/filter-select'
import { Pagination } from '@/components/pagination'
import { SearchInput } from '@/components/search-input'
import { ToneBadge, type Tone } from '@/components/tone-badge'
import { usePagination } from '@/lib/use-pagination'
import { ANALYSIS_STATUSES } from '@/lib/types'
import type { AnalysisOverview, AnalysisStatus } from '@/lib/types'

const tones: Record<AnalysisStatus, Tone> = {
  Concluída: 'progress',
  'Em processamento': 'review',
  Pendente: 'pending',
}

export function AnalysisList({ analyses }: { analyses: AnalysisOverview[] }) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<AnalysisStatus | ''>('')

  const search = query.trim().toLowerCase()
  const filtered = analyses.filter((analysis) => {
    const matchesSearch =
      search === '' || [analysis.number, analysis.client, analysis.type].some((value) => value.toLowerCase().includes(search))
    const matchesStatus = status === '' || analysis.status === status
    return matchesSearch && matchesStatus
  })

  const { page, setPage, totalPages, start, visible } = usePagination(filtered)
  const hasFilters = query !== '' || status !== ''

  function clearFilters() {
    setQuery('')
    setStatus('')
    setPage(1)
  }

  return (
    <section className="mt-6 rounded-lg border border-border bg-card">
      <div className="flex flex-col gap-3 border-b border-line px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <SearchInput
          value={query}
          onChange={(value) => {
            setQuery(value)
            setPage(1)
          }}
          placeholder="Buscar por processo, cliente ou tipo"
        />

        <div className="flex flex-wrap items-center gap-2">
          <FilterSelect
            label="Filtrar por situação"
            allLabel="Todas as situações"
            value={status}
            options={ANALYSIS_STATUSES}
            onChange={(value) => {
              setStatus(value)
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

      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-left">
          <thead className="bg-muted">
            <tr className="border-b border-line text-[10px] font-semibold uppercase tracking-[0.1em] text-subtle">
              <th className="px-5 py-3 font-medium">Processo</th>
              <th className="px-4 py-3 font-medium">Cliente</th>
              <th className="px-4 py-3 font-medium">Tipo</th>
              <th className="px-4 py-3 font-medium">Documentos analisados</th>
              <th className="px-4 py-3 font-medium">Situação</th>
              <th className="px-4 py-3 font-medium">Atualização</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((analysis) => (
              <tr key={analysis.processId} className="border-b border-line text-[13px] last:border-0 hover:bg-muted">
                <td className="px-5 py-4 font-medium">
                  <Link href={`/processos/${analysis.processId}`} className="text-link hover:underline">
                    {analysis.number}
                  </Link>
                </td>
                <td className="px-4 py-4 text-foreground">{analysis.client}</td>
                <td className="px-4 py-4 text-muted-foreground">{analysis.type}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-border">
                      <div
                        className="h-full rounded-full bg-olive"
                        style={{ width: `${(analysis.analyzedDocuments / analysis.totalDocuments) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {analysis.analyzedDocuments} de {analysis.totalDocuments}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <ToneBadge tone={tones[analysis.status]}>{analysis.status}</ToneBadge>
                </td>
                <td className="px-4 py-4 text-subtle">{analysis.updatedAt}</td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-sm text-subtle">
                  Nenhuma análise encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
