import type { ProcessStatus } from '@/lib/types'

// Record<ProcessStatus, string> obriga a ter uma cor para CADA status.
// Se criarmos um status novo em types.ts e esquecermos de colorir, o TypeScript avisa.
const styles: Record<ProcessStatus, string> = {
  'Em andamento': 'bg-status-progress-bg text-status-progress',
  'Em análise': 'bg-status-review-bg text-status-review',
  Pendente: 'bg-status-pending-bg text-status-pending',
  Concluído: 'bg-status-done-bg text-status-done',
}

export function StatusBadge({ status }: { status: ProcessStatus }) {
  return (
    <span className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  )
}
