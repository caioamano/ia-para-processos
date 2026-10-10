'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { deleteDocument } from '@/app/(app)/processos/[id]/documentos-actions'

// "Excluir" de um documento, com confirmação. Só aparece para Administrador e Advogado.
export function DeleteDocumentButton({ documentId, name }: { documentId: string; name: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    if (!window.confirm(`Excluir "${name}"? Essa ação não pode ser desfeita.`)) return
    setBusy(true)
    setError(null)
    const result = await deleteDocument(documentId)
    if (!result.ok) {
      setError(result.error)
      setBusy(false)
      return
    }
    router.refresh()
  }

  return (
    <>
      <button onClick={handleDelete} disabled={busy} className="text-xs font-medium text-destructive hover:underline disabled:opacity-50">
        {busy ? 'Excluindo…' : 'Excluir'}
      </button>
      {error && <span className="block text-[11px] text-destructive">{error}</span>}
    </>
  )
}
