import type { Metadata } from 'next'

import { NewProcessButton } from '@/components/new-process-button'
import { PageHeader } from '@/components/page-header'
import { ProcessList } from '@/components/processes/process-list'
import { processes } from '@/lib/mock-data'

export const metadata: Metadata = { title: 'Processos' }

export default function ProcessosPage() {
  return (
    <>
      <PageHeader
        eyebrow="Gestão"
        title="Processos"
        description="Pesquise, filtre e acompanhe todos os processos do escritório."
        action={<NewProcessButton />}
      />
      <ProcessList processes={processes} />
    </>
  )
}
