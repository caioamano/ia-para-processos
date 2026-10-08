import { Upload } from 'lucide-react'

// Ainda não faz nada: o envio de documentos é a Fase 8.
export function UploadDocumentButton() {
  return (
    <button className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-input bg-card px-3.5 text-xs font-medium text-primary transition-colors hover:bg-accent">
      <Upload className="size-4" /> Enviar documento
    </button>
  )
}
