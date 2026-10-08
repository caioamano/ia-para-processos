import Link from 'next/link'

export default function ProcessNotFound() {
  return (
    <div className="rounded-lg border border-border bg-card px-6 py-16 text-center">
      <h1 className="text-lg font-semibold text-primary">Processo não encontrado</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Este processo não existe ou não pertence ao seu escritório.
      </p>
      <Link href="/processos" className="mt-5 inline-block text-xs font-medium text-link hover:underline">
        Voltar para Processos
      </Link>
    </div>
  )
}
