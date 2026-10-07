import type { Metadata } from 'next'

import { ComingSoon } from '@/components/coming-soon'
import { PageHeader } from '@/components/page-header'

export const metadata: Metadata = { title: 'Processos' }

export default function ProcessosPage() {
  return (
    <>
      <PageHeader eyebrow="Gestão" title="Processos" description="Pesquise, filtre e acompanhe todos os processos do escritório." />
      <ComingSoon />
    </>
  )
}
