import { useState } from 'react'

// Controla a paginação de qualquer lista. Recebe a lista JÁ filtrada e devolve só a página atual.
// Usado nas telas de Processos, Documentos e Análises.
export function usePagination<T>(items: T[], pageSize = 10) {
  const [requestedPage, setPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  // Se os filtros reduzirem a lista, a página pedida pode deixar de existir: limitamos ao máximo.
  const page = Math.min(requestedPage, totalPages)
  const start = (page - 1) * pageSize

  return {
    page,
    setPage,
    totalPages,
    start,
    visible: items.slice(start, start + pageSize),
  }
}
