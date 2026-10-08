import type { ReactNode } from 'react'

export type Tone = 'progress' | 'review' | 'pending' | 'done'

// As quatro "famílias" de cor de status do globals.css.
const toneStyles: Record<Tone, string> = {
  progress: 'bg-status-progress-bg text-status-progress',
  review: 'bg-status-review-bg text-status-review',
  pending: 'bg-status-pending-bg text-status-pending',
  done: 'bg-status-done-bg text-status-done',
}

export function ToneBadge({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ${toneStyles[tone]}`}>{children}</span>
  )
}
