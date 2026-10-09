import type { ReactNode } from 'react'

import { NoProfile } from '@/components/layout/no-profile'
import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'
import { getSession } from '@/lib/data/queries'
import { formatLongDate } from '@/lib/format'

// A pasta "(app)" é um grupo de rotas: não aparece na URL, mas todas as telas dentro
// dela compartilham este layout (menu lateral + barra superior).
// Aqui buscamos QUEM está logado e de qual escritório, e repassamos ao menu e à barra superior.
export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await getSession()

  // Login existe, mas ainda não foi vinculado a um perfil de escritório.
  if (!session) return <NoProfile />

  const { user, office } = session

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar user={user} officeName={office.name} />
      <div className="min-w-0 flex-1">
        <Topbar user={user} officeName={office.name} todayLabel={formatLongDate(new Date())} />
        <main className="mx-auto max-w-[1440px] px-6 py-8 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  )
}
