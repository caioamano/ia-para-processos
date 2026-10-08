import Link from 'next/link'
import { MoreHorizontal } from 'lucide-react'

import { StatusBadge } from '@/components/status-badge'
import type { Process } from '@/lib/types'

// Tabela de processos reaproveitada pelo dashboard e pela tela de Processos.
// Não guarda estado: só desenha a lista que recebe.
export function ProcessesTable({ processes }: { processes: Process[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[800px] text-left">
        <thead className="bg-muted">
          <tr className="border-b border-line text-[10px] font-semibold uppercase tracking-[0.1em] text-subtle">
            <th className="px-5 py-3 font-medium">Número</th>
            <th className="px-4 py-3 font-medium">Cliente</th>
            <th className="px-4 py-3 font-medium">Tipo</th>
            <th className="px-4 py-3 font-medium">Responsável</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Atualização</th>
            <th className="px-3 py-3" />
          </tr>
        </thead>
        <tbody>
          {processes.map((process) => (
            <tr
              key={process.id}
              className="border-b border-line text-[13px] last:border-0 hover:bg-muted"
            >
              <td className="px-5 py-4 font-medium">
                <Link href={`/processos/${process.id}`} className="text-link hover:underline">
                  {process.number}
                </Link>
              </td>
              <td className="px-4 py-4 text-foreground">{process.client}</td>
              <td className="px-4 py-4 text-muted-foreground">{process.type}</td>
              <td className="px-4 py-4 text-muted-foreground">{process.responsible}</td>
              <td className="px-4 py-4">
                <StatusBadge status={process.status} />
              </td>
              <td className="px-4 py-4 text-subtle">{process.updatedAt}</td>
              <td className="px-3 py-4">
                <button
                  aria-label={`Mais opções para ${process.number}`}
                  className="text-subtle hover:text-primary"
                >
                  <MoreHorizontal className="size-4" />
                </button>
              </td>
            </tr>
          ))}
          {processes.length === 0 && (
            <tr>
              <td colSpan={7} className="px-5 py-10 text-center text-sm text-subtle">
                Nenhum processo encontrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
