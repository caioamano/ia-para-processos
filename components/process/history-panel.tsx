import type { TimelineEvent } from '@/lib/types'

export function HistoryPanel({ events }: { events: TimelineEvent[] }) {
  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <h2 className="text-[15px] font-semibold text-foreground">Movimentações</h2>
      <ol className="mt-5">
        {events.map((event, index) => (
          <li key={event.id} className="relative flex gap-4 pb-6 last:pb-0">
            {index < events.length - 1 && (
              <span className="absolute bottom-0 left-[5px] top-4 w-px bg-border" aria-hidden />
            )}
            <span className="relative mt-1.5 size-[11px] shrink-0 rounded-full border-2 border-olive bg-card" />
            <div>
              <p className="text-[13px] font-medium text-foreground">{event.title}</p>
              <p className="mt-0.5 text-[13px] leading-6 text-muted-foreground">{event.description}</p>
              <p className="mt-1 text-[11px] text-subtle">{event.date}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
