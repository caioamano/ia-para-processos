import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

import { DemoNotice } from '@/components/demo-notice'
import { PageHeader } from '@/components/page-header'
import { AnalysisPanel } from '@/components/process/analysis-panel'
import { DocumentsPanel } from '@/components/process/documents-panel'
import { HistoryPanel } from '@/components/process/history-panel'
import { QueryPanel } from '@/components/process/query-panel'
import { SummaryPanel } from '@/components/process/summary-panel'
import { StatusBadge } from '@/components/status-badge'
import { Tabs } from '@/components/tabs'
import { UploadDocumentButton } from '@/components/upload-document-button'
import { getProcessPage } from '@/lib/data/queries'

interface ProcessPageProps {
  // No Next.js 16, "params" e "searchParams" chegam como Promise e precisam de "await".
  params: Promise<{ id: string }>
  searchParams: Promise<{ cadastrado?: string }>
}

export async function generateMetadata({ params }: ProcessPageProps): Promise<Metadata> {
  const { id } = await params
  const data = await getProcessPage(id)
  return { title: data ? data.process.number : 'Processo não encontrado' }
}

export default async function ProcessPage({ params, searchParams }: ProcessPageProps) {
  const { id } = await params
  const { cadastrado } = await searchParams
  const data = await getProcessPage(id)

  // Se o processo não existe (ou é de outro escritório), mostra a página "não encontrado".
  if (!data) notFound()

  const { process: currentProcess, details, documents, timeline, analysis, conversation } = data

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
              <UploadDocumentButton />
            </div>
          }
        />
      </div>

      {cadastrado === '1' && (
        <p role="status" className="mt-6 rounded-lg border border-olive/40 bg-muted px-4 py-3 text-sm text-foreground">
          Processo cadastrado com sucesso. Documentos e análise poderão ser adicionados nas próximas etapas.
        </p>
      )}

      <DemoNotice>
        Os dados vêm do banco, mas são fictícios, e ainda não há leitura automática de documentos nem envio de
        arquivos.
      </DemoNotice>

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
              content: <AnalysisPanel sections={analysis} />,
            },
            {
              id: 'consulta',
              label: 'Consulta',
              content: <QueryPanel turns={conversation} />,
            },
            {
              id: 'historico',
              label: 'Histórico',
              content: <HistoryPanel events={timeline} />,
            },
          ]}
        />
      </div>
    </>
  )
}
