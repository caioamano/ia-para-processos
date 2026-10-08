import type { Metadata } from 'next'

import { ComingSoon } from '@/components/coming-soon'
import { PageHeader } from '@/components/page-header'

export const metadata: Metadata = { title: 'Equipe' }

export default function EquipePage() {
  return (
    <>
      <PageHeader eyebrow="Escritório" title="Equipe" description="Usuários, funções e permissões de acesso." />
      <ComingSoon />
    </>
  )
}
