import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { PageHeader } from '@/components/page-header'
import { NewProcessFlow } from '@/components/processes/new-process-flow'
import { getSession, getTeamMembers } from '@/lib/data/queries'
import { todayInSaoPaulo } from '@/lib/format'

export const metadata: Metadata = { title: 'Novo processo' }

// A leitura do PDF pelo Gemini pode levar dezenas de segundos (o padrão da Vercel é 10).
export const maxDuration = 60

export default async function NovoProcessoPage() {
  const [session, members] = await Promise.all([getSession(), getTeamMembers()])

  // Estagiário não cadastra processos (o banco também bloqueia; aqui só explicamos).
  const canCreate = session?.user.role === 'Administrador' || session?.user.role === 'Advogado'

  return (
    <>
      <Link
        href="/processos"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="size-3.5" /> Processos
      </Link>

      <div className="mt-5">
        <PageHeader
          eyebrow="Gestão"
          title="Novo processo"
          description="Cadastre um processo do escritório. Documentos e análise são adicionados depois."
        />
      </div>

      <div className="mt-8 max-w-3xl">
        {canCreate && session ? (
          <NewProcessFlow
            officeId={session.office.id}
            // Só pessoas com acesso ativo podem ser responsáveis.
            members={members.filter((member) => member.status === 'Ativo').map(({ id, name, role }) => ({ id, name, role }))}
            currentUserId={session.user.id}
            today={todayInSaoPaulo()}
          />
        ) : (
          <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
            Sua função não permite cadastrar processos. Peça a um administrador ou advogado do escritório.
          </div>
        )}
      </div>
    </>
  )
}
