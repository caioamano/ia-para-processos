import type { Metadata } from 'next'

import { ComingSoon } from '@/components/coming-soon'
import { PageHeader } from '@/components/page-header'

export const metadata: Metadata = { title: 'Configurações' }

export default function ConfiguracoesPage() {
  return (
    <>
      <PageHeader eyebrow="Escritório" title="Configurações" description="Dados do escritório, segurança e preferências." />
      <ComingSoon />
    </>
  )
}
