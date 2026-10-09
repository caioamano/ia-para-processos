import { SourceRef } from '@/components/source-ref'
import type { AnalysisSection } from '@/lib/types'

export function AnalysisPanel({ sections }: { sections: AnalysisSection[] }) {
  if (sections.length === 0) {
    return (
      <section className="rounded-lg border border-border bg-card p-5">
        <h2 className="text-[15px] font-semibold text-foreground">Análise</h2>
        <p className="mt-4 text-[13px] text-subtle">
          Ainda não há análise para este processo. Ela aparecerá aqui depois que os documentos forem enviados e lidos.
        </p>
      </section>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {sections.map((section) => (
        <section key={section.id} className="rounded-lg border border-border bg-card p-5">
          <h2 className="text-[15px] font-semibold text-foreground">{section.title}</h2>
          <div className="mt-4 divide-y divide-line">
            {section.items.map((item, index) => (
              <div key={`${item.label}-${index}`} className="py-3 first:pt-0 last:pb-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-subtle">{item.label}</p>
                <p className="mt-1 text-[13px] leading-6 text-foreground">{item.value}</p>
                {item.source && (
                  <div className="mt-2">
                    <SourceRef source={item.source} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
