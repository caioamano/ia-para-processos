import type { Metadata } from 'next'
import { BriefcaseBusiness, CheckCircle2, ClipboardList, FileText, Plus } from 'lucide-react'

import { ActivityChart } from '@/components/dashboard/activity-chart'
import { RecentProcesses } from '@/components/dashboard/recent-processes'
import { StatCard } from '@/components/dashboard/stat-card'
import { UpcomingDeadlines } from '@/components/dashboard/upcoming-deadlines'
import { PageHeader } from '@/components/page-header'
import { processes } from '@/lib/mock-data'

export const metadata: Metadata = { title: 'Visão geral' }

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        eyebrow="Painel do escritório"
        title="Visão geral"
        description="Acompanhe os processos e atividades do escritório."
        action={
          <button className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-3.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary-hover">
            <Plus className="size-4" /> Novo processo
          </button>
        }
      />

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Indicadores do escritório">
        <StatCard value="128" label="Processos ativos" note="+8 desde o último mês" icon={BriefcaseBusiness} />
        <StatCard value="84" label="Processos analisados" note="66% dos processos ativos" icon={ClipboardList} />
        <StatCard value="1.284" label="Documentos" note="32 adicionados este mês" icon={FileText} />
        <StatCard value="7" label="Pendências" note="3 com prazo nesta semana" icon={CheckCircle2} />
      </section>

      <RecentProcesses processes={processes} total={128} />

      <section className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <ActivityChart />
        <UpcomingDeadlines />
      </section>
    </>
  )
}
