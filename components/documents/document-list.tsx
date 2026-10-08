'use client'

import { useState } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'

import { DocumentStatusBadge } from '@/components/document-status-badge'
import { FilterSelect } from '@/components/filter-select'
import { Pagination } from '@/components/pagination'
import { SearchInput } from '@/components/search-input'
import { usePagination } from '@/lib/use-pagination'
import { DOCUMENT_STATUSES } from '@/lib/types'
import type { DocumentStatus, OfficeDocument } from '@/lib/types'

export function DocumentList({ documents }: { documents: OfficeDocument[] }) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<DocumentStatus | ''>('')

  const search = query.trim().toLowerCase()
  const filtered = documents.filter((document) => {
    const matchesSearch =
      search === '' ||
      [document.name, document.fileName, document.processNumber, document.client].some((value) =>
        value.toLowerCase().includes(search),
      )
    const matchesStatus = status === '' || document.status === status
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
    <section className="mt-8 rounded-lg border border-border bg-card">
      <div className="flex flex-col gap-3 border-b border-line px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <SearchInput
          value={query}
          onChange={(value) => {
            setQuery(value)
            setPage(1)
          }}
          placeholder="Buscar por documento, processo ou cliente"
        />

        <div className="flex flex-wrap items-center gap-2">
          <FilterSelect
            label="Filtrar por status"
            allLabel="Todos os status"
            value={status}
            options={DOCUMENT_STATUSES}
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
              <th className="px-5 py-3 font-medium">Documento</th>
              <th className="px-4 py-3 font-medium">Processo</th>
              <th className="px-4 py-3 font-medium">Páginas</th>
              <th className="px-4 py-3 font-medium">Tamanho</th>
              <th className="px-4 py-3 font-medium">Enviado em</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((document) => (
              <tr key={document.id} className="border-b border-line text-[13px] last:border-0 hover:bg-muted">
                <td className="px-5 py-4">
                  <span className="block font-medium text-foreground">{document.name}</span>
                  <span className="block text-[11px] text-subtle">{document.fileName}</span>
                </td>
                <td className="px-4 py-4">
                  <Link href={`/processos/${document.processId}`} className="font-medium text-link hover:underline">
                    {document.processNumber}
                  </Link>
                  <span className="block text-[11px] text-subtle">{document.client}</span>
                </td>
                <td className="px-4 py-4 text-muted-foreground">{document.pages}</td>
                <td className="px-4 py-4 text-muted-foreground">{document.size}</td>
                <td className="px-4 py-4 text-subtle">{document.uploadedAt}</td>
                <td className="px-4 py-4">
                  <DocumentStatusBadge status={document.status} />
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-sm text-subtle">
                  Nenhum documento encontrado.
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
        noun="documentos"
        onPageChange={setPage}
      />
    </section>
  )
}
