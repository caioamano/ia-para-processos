import { ToneBadge, type Tone } from '@/components/tone-badge'
import type { DocumentStatus } from '@/lib/types'

const tones: Record<DocumentStatus, Tone> = {
  Analisado: 'progress',
  'Em processamento': 'review',
  Pendente: 'pending',
}

export function DocumentStatusBadge({ status }: { status: DocumentStatus }) {
  return <ToneBadge tone={tones[status]}>{status}</ToneBadge>
}
