import { Check, Minus } from 'lucide-react'

import { permissions } from '@/lib/permissions'
import { ROLES } from '@/lib/types'

export function PermissionsMatrix() {
  return (
    <section className="mt-6 rounded-lg border border-border bg-card">
      <div className="border-b border-line px-5 py-5">
        <h2 className="text-[15px] font-semibold text-foreground">Funções e permissões</h2>
        <p className="mt-1 text-xs text-subtle">O que cada função pode fazer no ambiente do escritório.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left">
          <thead className="bg-muted">
            <tr className="border-b border-line text-[10px] font-semibold uppercase tracking-[0.1em] text-subtle">
              <th className="px-5 py-3 font-medium">Permissão</th>
              {ROLES.map((role) => (
                <th key={role} className="px-4 py-3 text-center font-medium">
                  {role}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {permissions.map((permission) => (
              <tr key={permission.label} className="border-b border-line text-[13px] last:border-0">
                <td className="px-5 py-3.5 text-foreground">{permission.label}</td>
                {ROLES.map((role) => {
                  const allowed = permission.roles.includes(role)
                  return (
                    <td key={role} className="px-4 py-3.5">
                      <span className="flex justify-center">
                        {allowed ? (
                          <Check className="size-4 text-olive" strokeWidth={2} aria-label="Permitido" />
                        ) : (
                          <Minus className="size-4 text-subtle" strokeWidth={1.8} aria-label="Não permitido" />
                        )}
                      </span>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
