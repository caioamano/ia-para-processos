import type { Metadata } from 'next'

import { ComingSoon } from '@/components/coming-soon'
import { PageHeader } from '@/components/page-header'

export const metadata: Metadata = { title: 'Documentos' }

export default function DocumentosPage() {
  return (
    <>
      <PageHeader eyebrow="Gestão" title="Documentos" description="Envie e organize os documentos de cada processo." />
      <ComingSoon />
    </>
  )
}
