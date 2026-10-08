interface PaginationProps {
  page: number
  totalPages: number
  start: number
  shown: number
  total: number
  noun: string
  onPageChange: (page: number) => void
}

const buttonClass =
  'h-8 rounded-md border border-input px-3 text-xs font-medium text-muted-foreground hover:bg-accent disabled:pointer-events-none disabled:opacity-40'

export function Pagination({ page, totalPages, start, shown, total, noun, onPageChange }: PaginationProps) {
  return (
    <div className="flex flex-col gap-3 border-t border-line px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-xs text-subtle">
        {total === 0 ? 'Nenhum resultado' : `Exibindo ${start + 1}–${start + shown} de ${total} ${noun}`}
      </span>

      <div className="flex items-center gap-3">
        <span className="text-xs text-subtle">
          Página {page} de {totalPages}
        </span>
        <div className="flex gap-2">
          <button onClick={() => onPageChange(page - 1)} disabled={page === 1} className={buttonClass}>
            Anterior
          </button>
          <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages} className={buttonClass}>
            Próxima
          </button>
        </div>
      </div>
    </div>
  )
}
