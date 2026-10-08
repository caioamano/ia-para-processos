import type { Metadata } from 'next'
import { UserPlus } from 'lucide-react'

import { DemoNotice } from '@/components/demo-notice'
import { PageHeader } from '@/components/page-header'
import { PermissionsMatrix } from '@/components/team/permissions-matrix'
import { TeamTable } from '@/components/team/team-table'
import { teamMembers } from '@/lib/mock-team'

export const metadata: Metadata = { title: 'Equipe' }

export default function EquipePage() {
  return (
    <>
      <PageHeader
        eyebrow="Escritório"
        title="Equipe"
        description="Usuários, funções e permissões de acesso."
        action={
          // Ainda não faz nada: os convites dependem da autenticação (Fase 5).
          <button className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-3.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary-hover">
            <UserPlus className="size-4" /> Convidar usuário
          </button>
        }
      />

      <DemoNotice>
        Usuários e permissões são fictícios. O convite de pessoas e o controle de acesso serão ativados junto com a
        autenticação.
      </DemoNotice>

      <TeamTable members={teamMembers} />
      <PermissionsMatrix />
    </>
  )
}
