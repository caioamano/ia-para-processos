import { MoreHorizontal } from 'lucide-react'

import { activityBars } from '@/lib/mock-data'

export function ActivityChart() {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[15px] font-semibold text-foreground">Atividade do escritório</h2>
          <p className="mt-1 text-xs text-subtle">Movimentações dos últimos 7 dias.</p>
        </div>
        <button className="text-subtle hover:text-primary" aria-label="Mais opções">
          <MoreHorizontal className="size-4" />
        </button>
      </div>

      <div className="mt-6 flex h-[116px] items-end gap-2 border-b border-border px-2">
        {activityBars.map((height, index) => (
          <div key={index} className="group flex flex-1 flex-col items-center justify-end gap-2">
            <div
              className="w-full max-w-[18px] rounded-t-sm bg-olive-soft transition-colors group-hover:bg-olive"
              style={{ height: `${height}%` }}
            />
          </div>
        ))}
      </div>

      <div className="mt-3 flex justify-between px-1 text-[10px] text-subtle">
        <span>01 out.</span>
        <span>03 out.</span>
        <span>05 out.</span>
        <span>07 out.</span>
      </div>
    </div>
  )
}
