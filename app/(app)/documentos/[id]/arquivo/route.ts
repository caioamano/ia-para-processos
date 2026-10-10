import { NextResponse } from 'next/server'

import { UUID_PATTERN } from '@/lib/documents'
import { createClient } from '@/lib/supabase/server'

// Abre o PDF de um documento. Fluxo: confere o login, confere que o documento é do escritório
// da pessoa (o RLS esconde os de outros), gera um link temporário (60 segundos) do Storage e
// redireciona para ele. O caminho do arquivo nunca aparece na tela.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const notFound = () => new NextResponse('Documento não encontrado.', { status: 404 })

  if (!UUID_PATTERN.test(id)) return notFound()

  const supabase = await createClient()

  const { data: document, error } = await supabase.from('documents').select('storage_path').eq('id', id).maybeSingle()
  if (error) return new NextResponse('Não foi possível abrir o documento.', { status: 500 })
  if (!document?.storage_path) return notFound()

  const { data: signed, error: signError } = await supabase.storage
    .from('documents')
    .createSignedUrl(document.storage_path, 60)
  if (signError || !signed) return notFound()

  const response = NextResponse.redirect(signed.signedUrl)
  response.headers.set('Cache-Control', 'no-store')
  return response
}
