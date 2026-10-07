import type { ReactNode } from 'react'

import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'

// A pasta "(app)" é um grupo de rotas: não aparece na URL, mas todas as telas dentro
// dela compartilham este layout (menu lateral + barra superior).
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <Topbar />
        <main className="mx-auto max-w-[1440px] px-6 py-8 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  )
}
