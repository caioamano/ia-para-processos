'use client'

import { usePathname } from 'next/navigation'
import { Bell } from 'lucide-react'

import { MobileNav } from '@/components/layout/mobile-nav'
import { office } from '@/lib/mock-data'
import { getCurrentNavItem } from '@/lib/navigation'

export function Topbar() {
  const pathname = usePathname()
  const current = getCurrentNavItem(pathname)

  return (
    <header className="flex h-[70px] items-center justify-between border-b border-border bg-card px-4 sm:px-6 lg:px-10">
      <div className="flex min-w-0 items-center gap-3">
        <MobileNav />
        {/* No celular só cabe o nome da tela; o escritório aparece a partir de telas médias */}
        <span className="hidden text-sm font-medium text-muted-foreground sm:inline">{office.name}</span>
        <span className="hidden text-subtle sm:inline">/</span>
        <span className="truncate text-sm text-subtle max-sm:font-medium max-sm:text-foreground">
          {current?.label}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <button aria-label="Notificações" className="relative text-muted-foreground hover:text-primary">
          <Bell className="size-[18px]" strokeWidth={1.8} />
          <span className="absolute -right-0.5 -top-0.5 size-1.5 rounded-full bg-olive" />
        </button>
        <div className="hidden h-5 w-px bg-border sm:block" />
        {/* Data fixa por enquanto (dados fictícios). */}
        <span className="hidden text-xs text-muted-foreground sm:inline">07 de outubro de 2026</span>
      </div>
    </header>
  )
}
