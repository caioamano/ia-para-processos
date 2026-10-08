import { FileSearch, FileUp, ListChecks } from 'lucide-react'

const steps = [
  {
    icon: FileUp,
    title: 'Envie os documentos',
    text: 'Anexe os PDFs do processo. Os documentos ficam organizados no ambiente do escritório, junto de cada processo.',
  },
  {
    icon: ListChecks,
    title: 'Acompanhe a análise',
    text: 'Veja o resumo estruturado do processo: partes, pedidos, valores, argumentos, decisões e prazos.',
  },
  {
    icon: FileSearch,
    title: 'Consulte com fonte',
    text: 'Pergunte sobre o processo e confira, na própria resposta, o documento e a página de onde a informação saiu.',
  },
]

export function HowItWorks() {
  return (
    <section id="como-funciona" className="scroll-mt-4 border-y border-border bg-card">
      <div className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-olive">Como funciona</p>
        <h2 className="mt-3 max-w-2xl font-serif text-3xl leading-tight tracking-[-0.02em] text-primary sm:text-4xl">
          Processos extensos, informações à mão.
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">
          Encontrar um despacho, um valor ou um pedido em centenas de páginas toma tempo. A LexIA reduz esse trabalho
          sem tirar do advogado a conferência da informação.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.title} className="rounded-lg border border-border bg-background p-6">
              <div className="flex items-center justify-between">
                <step.icon className="size-5 text-olive" strokeWidth={1.7} />
                <span className="text-xs font-medium text-subtle">0{index + 1}</span>
              </div>
              <h3 className="mt-5 text-[15px] font-semibold text-foreground">{step.title}</h3>
              <p className="mt-2 text-[13px] leading-6 text-muted-foreground">{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
