import type { Metadata } from 'next'

import { ComingSoon } from '@/components/coming-soon'
import { PageHeader } from '@/components/page-header'

export const metadata: Metadata = { title: 'Análises' }

export default function AnalisesPage() {
  return (
    <>
      <PageHeader eyebrow="Gestão" title="Análises" description="Resumos estruturados gerados a partir dos documentos." />
      <ComingSoon />
    </>
  )
}
