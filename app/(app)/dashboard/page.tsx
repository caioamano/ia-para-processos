import type { Metadata } from 'next'
import { BriefcaseBusiness, CheckCircle2, ClipboardList, FileText } from 'lucide-react'

import { ActivityChart } from '@/components/dashboard/activity-chart'
import { RecentProcesses } from '@/components/dashboard/recent-processes'
import { StatCard } from '@/components/dashboard/stat-card'
import { UpcomingDeadlines } from '@/components/dashboard/upcoming-deadlines'
import { NewProcessButton } from '@/components/new-process-button'
import { PageHeader } from '@/components/page-header'
import { getDashboardData, getRecentProcesses } from '@/lib/data/queries'

export const metadata: Metadata = { title: 'Visão geral' }

export default async function DashboardPage() {
  // Os 5 processos mais recentes + o total, e os indicadores e prazos (tudo do banco).
  const [{ processes, total }, dashboard] = await Promise.all([getRecentProcesses(5), getDashboardData()])

  return (
    <>
      <PageHeader
        eyebrow="Painel do escritório"
        title="Visão geral"
        description="Acompanhe os processos e atividades do escritório."
        action={<NewProcessButton />}
      />

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Indicadores do escritório">
        <StatCard {...dashboard.active} label="Processos ativos" icon={BriefcaseBusiness} />
        <StatCard {...dashboard.analyzed} label="Processos analisados" icon={ClipboardList} />
        <StatCard {...dashboard.documents} label="Documentos" icon={FileText} />
        <StatCard {...dashboard.pending} label="Prazos a vencer" icon={CheckCircle2} />
      </section>

      <RecentProcesses processes={processes} total={total} />

      <section className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <ActivityChart />
        <UpcomingDeadlines deadlines={dashboard.deadlines} />
      </section>
    </>
  )
}
