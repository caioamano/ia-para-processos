import type { Metadata } from 'next'
import { CheckCircle2, Clock, FileText, Hourglass } from 'lucide-react'

import { AnalysisList } from '@/components/analyses/analysis-list'
import { StatCard } from '@/components/dashboard/stat-card'
import { PageHeader } from '@/components/page-header'
import { getAnalysisOverview } from '@/lib/data/queries'

export const metadata: Metadata = { title: 'Análises' }

export default async function AnalisesPage() {
  const analyses = await getAnalysisOverview()

  // Os números dos cartões são calculados a partir da própria lista.
  const count = (status: string) => analyses.filter((analysis) => analysis.status === status).length
  const totalDocuments = analyses.reduce((sum, analysis) => sum + analysis.totalDocuments, 0)
  const analyzedDocuments = analyses.reduce((sum, analysis) => sum + analysis.analyzedDocuments, 0)
  // Se ainda não há documentos, evita dividir por zero.
  const percent = totalDocuments === 0 ? 0 : Math.round((analyzedDocuments / totalDocuments) * 100)

  return (
    <>
      <PageHeader
        eyebrow="Gestão"
        title="Análises"
        description="Acompanhe o andamento da análise dos documentos de cada processo."
      />

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Indicadores das análises">
        <StatCard
          value={String(count('Concluída'))}
          label="Análises concluídas"
          note="Todos os documentos analisados"
          icon={CheckCircle2}
        />
        <StatCard
          value={String(count('Em processamento'))}
          label="Em processamento"
          note="Documentos sendo analisados"
          icon={Clock}
        />
        <StatCard
          value={String(count('Pendente'))}
          label="Pendentes"
          note="Aguardando início da análise"
          icon={Hourglass}
        />
        <StatCard
          value={`${percent}%`}
          label="Documentos analisados"
          note={`${analyzedDocuments} de ${totalDocuments} documentos`}
          icon={FileText}
        />
      </section>

      <AnalysisList analyses={analyses} />
    </>
  )
}
