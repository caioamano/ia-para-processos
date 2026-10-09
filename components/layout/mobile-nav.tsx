'use client'

import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'

import { SidebarContent } from '@/components/layout/sidebar-content'
import type { CurrentUser } from '@/lib/types'

// Botão de menu + gaveta lateral para telas menores que 1024px.
export function MobileNav({ user, officeName }: { user: CurrentUser; officeName: string }) {
  const [open, setOpen] = useState(false)

  // Enquanto a gaveta está aberta: trava a rolagem da página, fecha com a tecla Esc
  // e fecha sozinha se a tela ficar grande (ex.: ao girar o tablet), quando o menu fixo aparece.
  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    function handleResize() {
      if (window.innerWidth >= 1024) setOpen(false)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('resize', handleResize)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('resize', handleResize)
    }
  }, [open])

  return (
    <div className="lg:hidden">
      <button
        aria-label="Abrir menu"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen(true)}
        className="flex size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-primary"
      >
        <Menu className="size-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          {/* Fundo escurecido: tocar nele fecha a gaveta */}
          <div className="absolute inset-0 bg-primary/40" onClick={() => setOpen(false)} aria-hidden />

          <div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navegação"
            className="absolute inset-y-0 left-0 flex w-[280px] max-w-[85vw] flex-col overflow-y-auto bg-muted px-4 py-5 shadow-xl"
          >
            <button
              aria-label="Fechar menu"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-4 flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-primary"
            >
              <X className="size-4" />
            </button>
            <SidebarContent user={user} officeName={officeName} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </div>
  )
}
