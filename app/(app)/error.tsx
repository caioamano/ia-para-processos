'use client'

import { Button } from '@/components/ui/button'

// Aparece quando uma tela do painel falha ao carregar os dados (ex.: o banco não respondeu).
// O detalhe técnico do erro fica nos logs da Vercel, não na tela.
export default function AppError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto mt-16 max-w-md rounded-lg border border-border bg-card p-6 text-center">
      <h1 className="text-base font-semibold text-foreground">Não foi possível carregar esta tela</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Houve um problema ao buscar os dados. Tente novamente; se continuar, saia e entre de novo na sua conta.
      </p>
      <Button onClick={reset} className="mt-5">
        Tentar novamente
      </Button>
    </div>
  )
}
