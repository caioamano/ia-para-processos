import type { Metadata } from 'next'

import { LoginForm } from '@/components/login/login-form'

export const metadata: Metadata = { title: 'Entrar' }

// Tela de login. Fica fora do grupo "(app)", por isso não tem menu lateral nem barra superior.
export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted px-4 py-10">
      <div className="w-full max-w-[400px]">
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-base font-semibold tracking-tight text-primary-foreground">
            L
          </div>
          <span className="text-[22px] font-semibold tracking-[-0.03em] text-primary">LexIA</span>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
          <h1 className="text-lg font-semibold text-foreground">Entrar no escritório</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Use o e-mail e a senha da sua conta.
          </p>
          <LoginForm />
        </div>
      </div>
    </main>
  )
}
