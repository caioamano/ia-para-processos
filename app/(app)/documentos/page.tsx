import type { Metadata } from 'next'

import { DocumentList } from '@/components/documents/document-list'
import { PageHeader } from '@/components/page-header'
import { UploadDocumentButton } from '@/components/upload-document-button'
import { getOfficeDocuments } from '@/lib/data/queries'

export const metadata: Metadata = { title: 'Documentos' }

export default async function DocumentosPage() {
  const documents = await getOfficeDocuments()

  return (
    <>
      <PageHeader
        eyebrow="Gestão"
        title="Documentos"
        description="Envie e organize os documentos de cada processo."
        action={<UploadDocumentButton />}
      />
      <DocumentList documents={documents} />
    </>
  )
}
