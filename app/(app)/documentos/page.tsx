import type { Metadata } from 'next'

import { DocumentList } from '@/components/documents/document-list'
import { PageHeader } from '@/components/page-header'
import { getOfficeDocuments } from '@/lib/data/queries'

export const metadata: Metadata = { title: 'Documentos' }

export default async function DocumentosPage() {
  const documents = await getOfficeDocuments()

  return (
    <>
      <PageHeader
        eyebrow="Gestão"
        title="Documentos"
        description="Todos os documentos do escritório. Para enviar um novo, abra o processo e use Enviar documento."
      />
      <DocumentList documents={documents} />
    </>
  )
}
