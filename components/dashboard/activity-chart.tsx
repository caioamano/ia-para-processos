import { MoreHorizontal } from 'lucide-react'

// Alturas (em %) de exemplo. O gráfico é ilustrativo até existir um registro de atividades real.
const activityBars = [42, 58, 35, 72, 54, 88, 64, 76, 48, 68, 82, 59, 92, 70]

export function ActivityChart() {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[15px] font-semibold text-foreground">Atividade do escritório</h2>
          <p className="mt-1 text-xs text-subtle">Gráfico ilustrativo (dados de exemplo).</p>
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
        <span>Há 14 dias</span>
        <span>Hoje</span>
      </div>
    </div>
  )
}
