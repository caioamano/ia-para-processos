'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown } from 'lucide-react'

import { SignOutButton } from '@/components/layout/sign-out-button'
import { currentUser, office } from '@/lib/mock-data'
import { isActivePath, navItems } from '@/lib/navigation'
import { cn } from '@/lib/utils'

// O conteúdo do menu lateral (logo, itens, usuário). Fica separado para ser usado em dois lugares:
// na barra fixa do computador (sidebar.tsx) e na gaveta do celular (mobile-nav.tsx).
// "onNavigate" avisa quem usa o menu que um link foi clicado (a gaveta usa isso para se fechar).
export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  // usePathname devolve a URL atual (ex.: "/processos"); é isso que marca o item ativo.
  const pathname = usePathname()

  return (
    <>
      <div className="flex items-center gap-3 px-3">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-sm font-semibold tracking-tight text-primary-foreground">
          L
        </div>
        <span className="text-[18px] font-semibold tracking-[-0.03em] text-primary">LexIA</span>
      </div>

      <div className="mt-9 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-subtle">
        Workspace
      </div>

      <nav className="mt-3 flex flex-col gap-1" aria-label="Navegação principal">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = isActivePath(pathname, href)
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'relative flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-[13px] transition-colors duration-150',
                active
                  ? 'bg-secondary font-medium text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-primary',
              )}
            >
              {active && (
                <span className="absolute bottom-2 left-0 top-2 w-0.5 rounded-full bg-primary" />
              )}
              <Icon className="size-[16px]" strokeWidth={1.8} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto border-t border-border pt-4">
        <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left hover:bg-accent">
          <div className="flex size-8 items-center justify-center rounded-full bg-olive text-[11px] font-semibold text-white">
            {currentUser.initials}
          </div>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[12px] font-medium text-foreground">
              {currentUser.name}
            </span>
            <span className="block text-[11px] text-subtle">{currentUser.role}</span>
          </span>
          <ChevronDown className="size-3.5 text-subtle" />
        </button>
        <SignOutButton />
        <p className="mt-3 px-3 text-[11px] text-subtle">{office.name}</p>
      </div>
    </>
  )
}
