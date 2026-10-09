import type { Metadata } from 'next'

import { NewProcessButton } from '@/components/new-process-button'
import { PageHeader } from '@/components/page-header'
import { ProcessList } from '@/components/processes/process-list'
import { getProcesses } from '@/lib/data/queries'

export const metadata: Metadata = { title: 'Processos' }

export default async function ProcessosPage() {
  const processes = await getProcesses()

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
