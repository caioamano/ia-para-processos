import { Plus } from 'lucide-react'

// Ainda não faz nada: o cadastro de processos é a Fase 7.
export function NewProcessButton() {
  return (
    <button className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-3.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary-hover">
      <Plus className="size-4" /> Novo processo
    </button>
  )
}
