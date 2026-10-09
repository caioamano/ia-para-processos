import Link from 'next/link'
import { Plus } from 'lucide-react'

// Leva ao formulário de cadastro. A tela de Processos só mostra este botão
// para quem pode cadastrar (Administrador e Advogado).
export function NewProcessButton() {
  return (
    <Link
      href="/processos/novo"
      className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-3.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
    >
      <Plus className="size-4" /> Novo processo
    </Link>
  )
}
