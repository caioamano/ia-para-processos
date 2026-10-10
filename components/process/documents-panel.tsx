import { DocumentStatusBadge } from '@/components/document-status-badge'
import { AnalyzeDocumentButton } from '@/components/process/analyze-document-button'
import { DeleteDocumentButton } from '@/components/process/delete-document-button'
import type { ProcessDocument } from '@/lib/types'

export function DocumentsPanel({
  documents,
  canDelete,
  canAnalyze,
}: {
  documents: ProcessDocument[]
  canDelete: boolean
  canAnalyze: boolean
}) {
  return (
    <section className="rounded-lg border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left">
          <thead className="bg-muted">
            <tr className="border-b border-line text-[10px] font-semibold uppercase tracking-[0.1em] text-subtle">
              <th className="px-5 py-3 font-medium">Documento</th>
              <th className="px-4 py-3 font-medium">Páginas</th>
              <th className="px-4 py-3 font-medium">Tamanho</th>
              <th className="px-4 py-3 font-medium">Enviado em</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Arquivo</th>
            </tr>
          </thead>
          <tbody>
            {documents.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-[13px] text-subtle">
                  Nenhum documento enviado ainda.
                </td>
              </tr>
            )}
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
                  <DocumentStatusBadge status={document.status} />
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-col items-start gap-1">
                    {document.hasFile ? (
                      <a
                        href={`/documentos/${document.id}/arquivo`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-link hover:underline"
                      >
                        Abrir PDF
                      </a>
                    ) : (
                      <span className="text-xs text-subtle" title="Documento de exemplo, sem arquivo guardado.">
                        Sem arquivo
                      </span>
                    )}
                    {canAnalyze && document.hasFile && (
                      <AnalyzeDocumentButton documentId={document.id} pages={document.pages} status={document.status} />
                    )}
                    {canDelete && <DeleteDocumentButton documentId={document.id} name={document.name} />}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-line px-5 py-3 text-xs text-subtle">
        {documents.length} {documents.length === 1 ? 'documento' : 'documentos'} neste processo
      </div>
    </section>
  )
}
