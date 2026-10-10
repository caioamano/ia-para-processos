import { NextResponse } from 'next/server'

import { getSession } from '@/lib/data/queries'
import { UUID_PATTERN } from '@/lib/documents'
import { geminiModel } from '@/lib/gemini'
import { extractProcessFromPdf } from '@/lib/gemini-extract'
import { createClient } from '@/lib/supabase/server'

// Rota TEMPORÁRIA para testar a leitura do PDF (Fase 9B) antes de existir a tela (9C).
// Abra, logado como Administrador:
//   /api/extracao-teste                      -> lê o PDF mais recente enviado ao seu escritório
//   /api/extracao-teste?documento=<id>       -> lê um documento específico
// ATENÇÃO: o PDF lido é ENVIADO ao Gemini. Use só documentos fictícios enquanto o projeto
// estiver no plano gratuito. Não grava nada no banco. Apague esta pasta quando a 9C estiver pronta.
export const maxDuration = 60

const BUCKET = 'documents'

export async function GET(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ ok: false, error: 'Entre no sistema primeiro.' }, { status: 401 })
  if (session.user.role !== 'Administrador') {
    return NextResponse.json({ ok: false, error: 'Só o Administrador pode usar este teste.' }, { status: 403 })
  }

  const documentId = new URL(request.url).searchParams.get('documento')
  if (documentId !== null && !UUID_PATTERN.test(documentId)) {
    return NextResponse.json({ ok: false, error: 'O parâmetro "documento" precisa ser um id válido.' }, { status: 400 })
  }

  // O cliente do Supabase usa a sessão da pessoa: o RLS garante que só aparecem documentos do escritório dela.
  const supabase = await createClient()
  let query = supabase.from('documents').select('id, name, pages, storage_path').not('storage_path', 'is', null)
  query = documentId ? query.eq('id', documentId) : query.order('uploaded_at', { ascending: false }).limit(1)
  const { data: rows, error } = await query
  if (error) {
    console.error('Falha ao buscar documento para o teste:', error.message)
    return NextResponse.json({ ok: false, error: 'Não foi possível buscar o documento.' }, { status: 500 })
  }
  const document = rows?.[0]
  if (!document?.storage_path) {
    return NextResponse.json(
      { ok: false, error: 'Nenhum documento com PDF encontrado. Envie um PDF a um processo primeiro.' },
      { status: 404 },
    )
  }

  const { data: blob, error: downloadError } = await supabase.storage.from(BUCKET).download(document.storage_path)
  if (downloadError || !blob) {
    return NextResponse.json({ ok: false, error: 'Não foi possível baixar o PDF do armazenamento.' }, { status: 500 })
  }

  const result = await extractProcessFromPdf(new Uint8Array(await blob.arrayBuffer()), document.pages)
  if (!result.ok) {
    // "detalhe" é o motivo técnico: só aparece aqui, nesta rota de Administrador.
    return NextResponse.json(
      { ok: false, error: result.error, detalhe: result.detail ?? null, modelo: geminiModel(), documento: { id: document.id, nome: document.name } },
      { status: 502 },
    )
  }

  return NextResponse.json({
    ok: true,
    documento: { id: document.id, nome: document.name, paginas: document.pages },
    modelo: result.model,
    paginasEnviadas: result.pagesSent,
    duracaoMs: result.durationMs,
    tokens: result.tokens,
    avisos: result.extraction.warnings,
    resultado: result.extraction,
  })
}
