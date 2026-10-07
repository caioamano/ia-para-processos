import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  value: string
  label: string
  note: string
  icon: LucideIcon
}

export function StatCard({ value, label, note, icon: Icon }: StatCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[27px] font-semibold tracking-[-0.04em] text-primary">{value}</p>
          <p className="mt-1 text-[13px] text-muted-foreground">{label}</p>
        </div>
        <Icon className="size-[18px] text-olive" strokeWidth={1.7} />
      </div>
      <p className="mt-5 text-[11px] text-subtle">{note}</p>
    </div>
  )
}
