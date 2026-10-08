import { SourceRef } from '@/components/source-ref'
import type { Process, ProcessDetails } from '@/lib/types'

export function SummaryPanel({ process, details }: { process: Process; details: ProcessDetails }) {
  const fields = [
    { label: 'Número', value: process.number },
    { label: 'Tipo', value: process.type },
    { label: 'Cliente', value: process.client },
    { label: 'Parte contrária', value: details.counterparty },
    { label: 'Juízo', value: details.court },
    { label: 'Valor da causa', value: details.caseValue },
    { label: 'Distribuição', value: details.distributedAt },
    { label: 'Responsável', value: process.responsible },
    { label: 'Última atualização', value: process.updatedAt },
  ]

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <section className="rounded-lg border border-border bg-card p-5">
        <h2 className="text-[15px] font-semibold text-foreground">Informações do processo</h2>
        <dl className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2">
          {fields.map((field) => (
            <div key={field.label}>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-subtle">{field.label}</dt>
              <dd className="mt-1 text-[13px] text-foreground">{field.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="rounded-lg border border-border bg-card p-5">
        <h2 className="text-[15px] font-semibold text-foreground">Resumo</h2>
        <p className="mt-4 text-[13px] leading-6 text-muted-foreground">
          Ação do tipo {process.type.toLowerCase()} proposta por {process.client} em face de {details.counterparty},
          distribuída em {details.distributedAt} à {details.court}. A última movimentação registrada foi em{' '}
          {process.updatedAt}.
        </p>
        <div className="mt-4">
          <SourceRef source={{ document: 'Petição Inicial', page: 1 }} />
        </div>
      </section>
    </div>
  )
}
