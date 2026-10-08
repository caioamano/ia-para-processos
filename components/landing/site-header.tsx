import Link from 'next/link'

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-sm font-semibold tracking-tight text-primary-foreground">
            L
          </span>
          <span className="text-[18px] font-semibold tracking-[-0.03em] text-primary">LexIA</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Seções da página">
          <a href="#como-funciona" className="text-sm text-muted-foreground hover:text-primary">
            Como funciona
          </a>
          <a href="#seguranca" className="text-sm text-muted-foreground hover:text-primary">
            Segurança
          </a>
        </nav>

        {/* Na Fase 5 (autenticação) este link passa a apontar para /login. */}
        <Link
          href="/dashboard"
          className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          Acessar o sistema
        </Link>
      </div>
    </header>
  )
}
