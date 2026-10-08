import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer>
      <div className="bg-primary">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 py-14 md:flex-row md:items-center">
          <h2 className="max-w-xl font-serif text-3xl leading-tight tracking-[-0.02em] text-primary-foreground">
            Veja como o escritório enxerga os processos.
          </h2>
          <Link
            href="/dashboard"
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-md bg-card px-6 text-sm font-medium text-primary transition-colors hover:bg-accent"
          >
            Conhecer a interface
          </Link>
        </div>
      </div>

      <div className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-6 py-6 text-xs text-subtle sm:flex-row sm:justify-between">
          <span>© 2026 LexIA</span>
          <span>Software em desenvolvimento. Demonstração com dados fictícios.</span>
        </div>
      </div>
    </footer>
  )
}
