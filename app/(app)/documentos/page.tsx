import type { Metadata } from 'next'

import { DocumentList } from '@/components/documents/document-list'
import { PageHeader } from '@/components/page-header'
import { UploadDocumentButton } from '@/components/upload-document-button'
import { getAllDocuments } from '@/lib/mock-process-details'

export const metadata: Metadata = { title: 'Documentos' }

export default function DocumentosPage() {
  return (
    <>
      <PageHeader
        eyebrow="Gestão"
        title="Documentos"
        description="Envie e organize os documentos de cada processo."
        action={<UploadDocumentButton />}
      />
      <DocumentList documents={getAllDocuments()} />
    </>
  )
}
