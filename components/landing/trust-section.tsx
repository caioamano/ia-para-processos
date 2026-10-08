import { Scale, ShieldCheck } from 'lucide-react'

const principles = [
  {
    icon: ShieldCheck,
    title: 'Pensado para o sigilo profissional',
    text: 'Cada escritório terá um ambiente próprio, com usuários, processos e documentos separados dos demais e controle de acesso por função.',
  },
  {
    icon: Scale,
    title: 'A decisão continua sendo do advogado',
    text: 'A LexIA não substitui o profissional nem faz afirmações jurídicas sem fonte. Ela ajuda a localizar e organizar informações para que você as confira nos documentos.',
  },
]

export function TrustSection() {
  return (
    <section id="seguranca" className="mx-auto max-w-6xl scroll-mt-4 px-6 py-16 lg:py-20">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-olive">Segurança e responsabilidade</p>
      <h2 className="mt-3 max-w-2xl font-serif text-3xl leading-tight tracking-[-0.02em] text-primary sm:text-4xl">
        Um software jurídico, não um atalho.
      </h2>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {principles.map((principle) => (
          <div key={principle.title} className="rounded-lg border border-border bg-card p-6">
            <principle.icon className="size-5 text-olive" strokeWidth={1.7} />
            <h3 className="mt-5 text-[15px] font-semibold text-foreground">{principle.title}</h3>
            <p className="mt-2 text-[13px] leading-6 text-muted-foreground">{principle.text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
