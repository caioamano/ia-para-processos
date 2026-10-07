'use client'

import { usePathname } from 'next/navigation'
import { Bell } from 'lucide-react'

import { office } from '@/lib/mock-data'
import { getCurrentNavItem } from '@/lib/navigation'

export function Topbar() {
  const pathname = usePathname()
  const current = getCurrentNavItem(pathname)

  return (
    <header className="flex h-[70px] items-center justify-between border-b border-border bg-card px-6 lg:px-10">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">{office.name}</span>
        <span className="text-subtle">/</span>
        <span className="text-sm text-subtle">{current?.label}</span>
      </div>

      <div className="flex items-center gap-4">
        <button aria-label="Notificações" className="relative text-muted-foreground hover:text-primary">
          <Bell className="size-[18px]" strokeWidth={1.8} />
          <span className="absolute -right-0.5 -top-0.5 size-1.5 rounded-full bg-olive" />
        </button>
        <div className="hidden h-5 w-px bg-border sm:block" />
        {/* Data fixa por enquanto (dados fictícios). */}
        <span className="text-xs text-muted-foreground">07 de outubro de 2026</span>
      </div>
    </header>
  )
}
