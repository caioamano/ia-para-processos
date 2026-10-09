import { ToneBadge } from '@/components/tone-badge'
import type { TeamMember } from '@/lib/types'

function initialsOf(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
}

export function TeamTable({ members, currentUserId }: { members: TeamMember[]; currentUserId: string }) {
  return (
    <section className="mt-6 rounded-lg border border-border bg-card">
      <div className="border-b border-line px-5 py-5">
        <h2 className="text-[15px] font-semibold text-foreground">Usuários ({members.length})</h2>
        <p className="mt-1 text-xs text-subtle">Pessoas com acesso ao ambiente do escritório.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left">
          <thead className="bg-muted">
            <tr className="border-b border-line text-[10px] font-semibold uppercase tracking-[0.1em] text-subtle">
              <th className="px-5 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">Função</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Último acesso</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} className="border-b border-line text-[13px] last:border-0 hover:bg-muted">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-olive text-[11px] font-semibold text-white">
                      {initialsOf(member.name)}
                    </div>
                    <div>
                      <span className="block font-medium text-foreground">
                        {member.name}
                        {member.id === currentUserId && <span className="ml-2 text-[11px] text-subtle">(você)</span>}
                      </span>
                      <span className="block text-[11px] text-subtle">{member.email}</span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-muted-foreground">{member.role}</td>
                <td className="px-4 py-4">
                  <ToneBadge tone={member.status === 'Ativo' ? 'progress' : 'pending'}>{member.status}</ToneBadge>
                </td>
                <td className="px-4 py-4 text-subtle">{member.lastAccess}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
