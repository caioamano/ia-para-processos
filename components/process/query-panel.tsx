import { SourceRef } from '@/components/source-ref'
import type { ConversationTurn } from '@/lib/types'

export function QueryPanel({ turns }: { turns: ConversationTurn[] }) {
  return (
    <div className="grid gap-6">
      <section className="rounded-lg border border-border bg-card p-5">
        <h2 className="text-[15px] font-semibold text-foreground">Consultar processo</h2>
        <p className="mt-1 text-xs text-subtle">
          Pergunte sobre o processo. Cada resposta indica o documento e a página de onde veio a informação.
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            disabled
            placeholder="Ex.: Qual é o valor da causa?"
            aria-label="Pergunta sobre o processo"
            className="h-9 flex-1 rounded-md border border-input bg-muted px-3 text-xs outline-none placeholder:text-subtle disabled:cursor-not-allowed disabled:opacity-70"
          />
          <button
            disabled
            className="h-9 rounded-md bg-primary px-4 text-xs font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40"
          >
            Consultar
          </button>
        </div>
        <p className="mt-2 text-[11px] text-subtle">Disponível quando a leitura dos documentos for conectada.</p>
      </section>

      <section className="rounded-lg border border-border bg-card p-5">
        <h2 className="text-[15px] font-semibold text-foreground">Exemplo de resposta</h2>
        <div className="mt-4 divide-y divide-line">
          {turns.map((turn) => (
            <div key={turn.question} className="py-4 first:pt-0 last:pb-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-subtle">Pergunta</p>
              <p className="mt-1 text-[13px] font-medium text-foreground">{turn.question}</p>
              <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.1em] text-subtle">Resposta</p>
              <p className="mt-1 text-[13px] leading-6 text-foreground">{turn.answer}</p>
              <div className="mt-2">
                <SourceRef source={turn.source} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
