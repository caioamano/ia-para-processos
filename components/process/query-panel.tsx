import { AskForm } from '@/components/process/ask-form'
import { SourceRef } from '@/components/source-ref'
import type { ConversationTurn } from '@/lib/types'

export function QueryPanel({
  turns,
  processId,
  hasDocuments,
}: {
  turns: ConversationTurn[]
  processId: string
  hasDocuments: boolean
}) {
  return (
    <div className="grid gap-6">
      <section className="rounded-lg border border-border bg-card p-5">
        <h2 className="text-[15px] font-semibold text-foreground">Consultar processo</h2>
        <p className="mt-1 text-xs text-subtle">
          Pergunte sobre o processo. Cada resposta indica o documento e a página de onde veio a informação.
        </p>
        <AskForm processId={processId} hasDocuments={hasDocuments} />
        <p className="mt-3 text-[11px] text-subtle">
          As respostas vêm só dos documentos enviados ao processo e podem conter erros: confira na fonte indicada. Cada pergunta é independente
          da anterior.
        </p>
      </section>

      <section className="rounded-lg border border-border bg-card p-5">
        <h2 className="text-[15px] font-semibold text-foreground">Consultas anteriores</h2>
        {turns.length === 0 && <p className="mt-4 text-[13px] text-subtle">Nenhuma consulta feita ainda.</p>}
        <div className="mt-4 divide-y divide-line">
          {turns.map((turn, index) => (
            <div key={`${turn.question}-${index}`} className="py-4 first:pt-0 last:pb-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-subtle">Pergunta</p>
              <p className="mt-1 text-[13px] font-medium text-foreground">{turn.question}</p>
              <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.1em] text-subtle">Resposta</p>
              <p className="mt-1 text-[13px] leading-6 text-foreground">{turn.answer}</p>
              {turn.sources && turn.sources.length > 0 ? (
                <div className="mt-3 space-y-2">
                  {turn.sources.map((item, sourceIndex) => (
                    <div key={`${item.source.document}-${item.source.page}-${sourceIndex}`}>
                      <SourceRef source={item.source} />
                      {item.quote && <p className="mt-1 text-xs italic leading-5 text-subtle">“{item.quote}”</p>}
                      {item.check === 'verified' && <p className="mt-0.5 text-[11px] text-subtle">Trecho conferido no texto do documento.</p>}
                      {item.check === 'corrected' && (
                        <p className="mt-0.5 text-[11px] text-subtle">Trecho conferido no texto do documento (a página foi corrigida).</p>
                      )}
                      {item.check === 'unverifiable' && (
                        <p className="mt-0.5 text-[11px] text-subtle">
                          Não foi possível conferir este trecho automaticamente (o PDF não tem texto selecionável). Confira no documento.
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : turn.source ? (
                <div className="mt-2">
                  <SourceRef source={turn.source} />
                </div>
              ) : turn.sourceMissing ? (
                <p className="mt-2 text-[11px] text-subtle">O documento de origem desta resposta foi excluído.</p>
              ) : null}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
