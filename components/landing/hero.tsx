import Link from 'next/link'

import { SourceRef } from '@/components/source-ref'
import { ToneBadge } from '@/components/tone-badge'

export function Hero() {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 lg:grid-cols-[1.05fr_1fr] lg:py-24">
      <div>
        <p className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[11px] font-medium text-muted-foreground">
          <span className="size-1.5 rounded-full bg-olive" />
          Em desenvolvimento · demonstração com dados fictícios
        </p>

        <h1 className="mt-6 font-serif text-[40px] leading-[1.08] tracking-[-0.02em] text-primary sm:text-5xl lg:text-[50px]">
          Menos tempo procurando.
          <br />
          Mais tempo advogando.
        </h1>

        <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground">
          A LexIA organiza os processos do escritório e permite consultar partes, pedidos, valores e despachos de
          processos extensos, sempre indicando o documento e a página de onde cada informação veio.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            Acessar o sistema
          </Link>
          <a
            href="#como-funciona"
            className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-card px-6 text-sm font-medium text-primary transition-colors hover:bg-accent"
          >
            Como funciona
          </a>
        </div>
      </div>

      {/* Exemplo do produto: pergunta, resposta e fonte */}
      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-olive">Consultar processo</p>
            <p className="mt-1 text-sm font-medium text-primary">0001234-56.2026.8.16.0001</p>
          </div>
          <ToneBadge tone="progress">Em andamento</ToneBadge>
        </div>

        <div className="space-y-6 p-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-subtle">Pergunta</p>
            <p className="mt-1 text-sm font-medium text-foreground">Qual é o valor da causa?</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-subtle">Resposta</p>
            <p className="mt-1 text-[15px] leading-6 text-foreground">
              O valor da causa informado na petição inicial é de R$ 85.000,00.
            </p>
            <div className="mt-3">
              <SourceRef source={{ document: 'Petição Inicial', page: 4 }} />
            </div>
          </div>
        </div>

        <div className="rounded-b-xl border-t border-line bg-muted px-5 py-3 text-[11px] text-subtle">
          Exemplo ilustrativo com dados fictícios.
        </div>
      </div>
    </section>
  )
}
