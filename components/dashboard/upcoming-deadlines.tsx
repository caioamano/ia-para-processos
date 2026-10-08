import { deadlines } from '@/lib/mock-data'
import type { DeadlineTone } from '@/lib/types'

const toneStyles: Record<DeadlineTone, string> = {
  pending: 'bg-status-pending-bg text-status-pending',
  progress: 'bg-status-progress-bg text-status-progress',
  review: 'bg-status-review-bg text-status-review',
}

export function UpcomingDeadlines() {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[15px] font-semibold text-foreground">Próximos prazos</h2>
          <p className="mt-1 text-xs text-subtle">Atenção necessária.</p>
        </div>
        <button className="text-xs font-medium text-link hover:underline">Ver agenda</button>
      </div>

      <div className="mt-5 flex flex-col gap-4">
        {deadlines.map((deadline) => (
          <div key={deadline.id} className="flex items-center gap-3">
            <div
              className={`flex size-9 flex-col items-center justify-center rounded-md ${toneStyles[deadline.tone]}`}
            >
              <span className="text-[10px] font-medium">{deadline.month}</span>
              <span className="text-sm font-semibold leading-3">{deadline.day}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-foreground">{deadline.title}</p>
              <p className="mt-1 text-[11px] text-subtle">
                {deadline.processNumber} · {deadline.when}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
