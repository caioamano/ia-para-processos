import type { Metadata } from 'next'

import { NewProcessButton } from '@/components/new-process-button'
import { PageHeader } from '@/components/page-header'
import { ProcessList } from '@/components/processes/process-list'
import { getProcesses, getSession } from '@/lib/data/queries'

export const metadata: Metadata = { title: 'Processos' }

export default async function ProcessosPage() {
  const [processes, session] = await Promise.all([getProcesses(), getSession()])
  const canCreate = session?.user.role === 'Administrador' || session?.user.role === 'Advogado'

  return (
    <>
      <PageHeader
        eyebrow="Gestão"
        title="Processos"
        description="Pesquise, filtre e acompanhe todos os processos do escritório."
        action={canCreate ? <NewProcessButton /> : undefined}
      />
      <ProcessList processes={processes} />
    </>
  )
}
