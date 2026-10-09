import type { Metadata } from 'next'
import { UserPlus } from 'lucide-react'

import { DemoNotice } from '@/components/demo-notice'
import { PageHeader } from '@/components/page-header'
import { PermissionsMatrix } from '@/components/team/permissions-matrix'
import { TeamTable } from '@/components/team/team-table'
import { getSession, getTeamMembers } from '@/lib/data/queries'

export const metadata: Metadata = { title: 'Equipe' }

export default async function EquipePage() {
  const [members, session] = await Promise.all([getTeamMembers(), getSession()])

  return (
    <>
      <PageHeader
        eyebrow="Escritório"
        title="Equipe"
        description="Usuários, funções e permissões de acesso."
        action={
          // Ainda não faz nada: o convite de pessoas será construído em uma fase futura.
          <button className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-3.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary-hover">
            <UserPlus className="size-4" /> Convidar usuário
          </button>
        }
      />

      <DemoNotice>
        Os usuários vêm do banco, mas são fictícios. O convite de pessoas e a edição de funções ainda não
        funcionam; a tabela de permissões abaixo explica as regras que o banco já aplica.
      </DemoNotice>

      <TeamTable members={members} currentUserId={session?.user.id ?? ''} />
      <PermissionsMatrix />
    </>
  )
}
