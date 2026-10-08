import type { DocumentStatus, ProcessDocument } from '@/lib/types'

// Reaproveita as cores de status criadas no globals.css.
const statusStyles: Record<DocumentStatus, string> = {
  Analisado: 'bg-status-progress-bg text-status-progress',
  'Em processamento': 'bg-status-review-bg text-status-review',
  Pendente: 'bg-status-pending-bg text-status-pending',
}

export function DocumentsPanel({ documents }: { documents: ProcessDocument[] }) {
  return (
    <section className="rounded-lg border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left">
          <thead className="bg-muted">
            <tr className="border-b border-line text-[10px] font-semibold uppercase tracking-[0.1em] text-subtle">
              <th className="px-5 py-3 font-medium">Documento</th>
              <th className="px-4 py-3 font-medium">Páginas</th>
              <th className="px-4 py-3 font-medium">Tamanho</th>
              <th className="px-4 py-3 font-medium">Enviado em</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((document) => (
              <tr key={document.id} className="border-b border-line text-[13px] last:border-0 hover:bg-muted">
                <td className="px-5 py-4">
                  <span className="block font-medium text-foreground">{document.name}</span>
                  <span className="block text-[11px] text-subtle">{document.fileName}</span>
                </td>
                <td className="px-4 py-4 text-muted-foreground">{document.pages}</td>
                <td className="px-4 py-4 text-muted-foreground">{document.size}</td>
                <td className="px-4 py-4 text-subtle">{document.uploadedAt}</td>
                <td className="px-4 py-4">
                  <span className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ${statusStyles[document.status]}`}>
                    {document.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-line px-5 py-3 text-xs text-subtle">
        {documents.length} documentos neste processo
      </div>
    </section>
  )
}
