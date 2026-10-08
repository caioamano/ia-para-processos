import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Upload } from 'lucide-react'

import { DemoNotice } from '@/components/demo-notice'
import { PageHeader } from '@/components/page-header'
import { AnalysisPanel } from '@/components/process/analysis-panel'
import { DocumentsPanel } from '@/components/process/documents-panel'
import { HistoryPanel } from '@/components/process/history-panel'
import { QueryPanel } from '@/components/process/query-panel'
import { SummaryPanel } from '@/components/process/summary-panel'
import { StatusBadge } from '@/components/status-badge'
import { Tabs } from '@/components/tabs'
import {
  getAnalysis,
  getConversation,
  getDocuments,
  getProcessById,
  getProcessDetails,
  getTimeline,
} from '@/lib/mock-process-details'

interface ProcessPageProps {
  // No Next.js 16, "params" chega como uma Promise e precisa de "await".
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: ProcessPageProps): Promise<Metadata> {
  const { id } = await params
  const currentProcess = getProcessById(id)
  return { title: currentProcess ? currentProcess.number : 'Processo não encontrado' }
}

export default async function ProcessPage({ params }: ProcessPageProps) {
  const { id } = await params
  const currentProcess = getProcessById(id)

  // Se o processo não existe (ou é de outro escritório), mostra a página "não encontrado".
  if (!currentProcess) notFound()

  const details = getProcessDetails(currentProcess)
  const documents = getDocuments(currentProcess)

  return (
    <>
      <Link
        href="/processos"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="size-3.5" /> Processos
      </Link>

      <div className="mt-5">
        <PageHeader
          eyebrow={`Processo · ${currentProcess.type}`}
          title={currentProcess.number}
          description={`${currentProcess.client} · Responsável: ${currentProcess.responsible}`}
          action={
            <div className="flex items-center gap-3">
              <StatusBadge status={currentProcess.status} />
              <button className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-input bg-card px-3.5 text-xs font-medium text-primary transition-colors hover:bg-accent">
                <Upload className="size-4" /> Enviar documento
              </button>
            </div>
          }
        />
      </div>

      <DemoNotice />

      <div className="mt-6">
        <Tabs
          items={[
            {
              id: 'resumo',
              label: 'Resumo',
              content: <SummaryPanel process={currentProcess} details={details} />,
            },
            {
              id: 'documentos',
              label: `Documentos (${documents.length})`,
              content: <DocumentsPanel documents={documents} />,
            },
            {
              id: 'analise',
              label: 'Análise',
              content: <AnalysisPanel sections={getAnalysis(currentProcess)} />,
            },
            {
              id: 'consulta',
              label: 'Consulta',
              content: <QueryPanel turns={getConversation(currentProcess)} />,
            },
            {
              id: 'historico',
              label: 'Histórico',
              content: <HistoryPanel events={getTimeline(currentProcess)} />,
            },
          ]}
        />
      </div>
    </>
  )
}
