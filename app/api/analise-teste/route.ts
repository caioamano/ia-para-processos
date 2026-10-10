import { NextResponse } from 'next/server'

import { getSession } from '@/lib/data/queries'
import { UUID_PATTERN } from '@/lib/documents'
import { ANALYSIS_MAX_PAGES, planAnalysisChunks } from '@/lib/document-analysis'
import { analyzePdfChunk } from '@/lib/gemini-analyze'
import { createClient } from '@/lib/supabase/server'

// Rota TEMPORÁRIA para testar a análise de documentos (Fase 10A) antes de existir o botão (10B).
// Abra, logado como Administrador:
//   /api/analise-teste                          -> analisa a 1ª parte (10 páginas) do PDF mais recente
//   /api/analise-teste?documento=<id>&parte=1   -> outro documento e/ou a parte seguinte (0, 1, 2...)
//   /api/analise-teste?raciocinio=low           -> pede ao Gemini menos "raciocínio" (minimal, low, medium, high) para comparar a velocidade
// ATENÇÃO: o trecho do PDF é ENVIADO ao Gemini. Use só documentos fictícios enquanto o projeto
// estiver no plano gratuito. Não grava nada no banco. Apague esta pasta quando a 10B estiver pronta.
export const maxDuration = 60

const BUCKET = 'documents'

export async function GET(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ ok: false, error: 'Entre no sistema primeiro.' }, { status: 401 })
  if (session.user.role !== 'Administrador') {
    return NextResponse.json({ ok: false, error: 'Só o Administrador pode usar este teste.' }, { status: 403 })
  }

  const params = new URL(request.url).searchParams
  const documentId = params.get('documento')
  if (documentId !== null && !UUID_PATTERN.test(documentId)) {
    return NextResponse.json({ ok: false, error: 'O parâmetro "documento" precisa ser um id válido.' }, { status: 400 })
  }
  const partIndex = Number(params.get('parte') ?? '0')
  if (!Number.isInteger(partIndex) || partIndex < 0) {
    return NextResponse.json({ ok: false, error: 'O parâmetro "parte" precisa ser 0, 1, 2...' }, { status: 400 })
  }

  const supabase = await createClient()
  let query = supabase.from('documents').select('id, name, pages, storage_path').not('storage_path', 'is', null)
  query = documentId ? query.eq('id', documentId) : query.order('uploaded_at', { ascending: false }).limit(1)
  const { data: rows, error } = await query
  if (error) {
    console.error('Falha ao buscar documento para o teste de análise:', error.message)
    return NextResponse.json({ ok: false, error: 'Não foi possível buscar o documento.' }, { status: 500 })
  }
  const document = rows?.[0]
  if (!document?.storage_path) {
    return NextResponse.json({ ok: false, error: 'Nenhum documento com PDF encontrado.' }, { status: 404 })
  }
  if (document.pages > ANALYSIS_MAX_PAGES) {
    return NextResponse.json(
      { ok: false, error: `Por enquanto a análise aceita documentos de até ${ANALYSIS_MAX_PAGES} páginas (este tem ${document.pages}).` },
      { status: 422 },
    )
  }

  const plan = planAnalysisChunks(document.pages)
  const range = plan[partIndex]
  if (!range) {
    return NextResponse.json({ ok: false, error: `Este documento tem ${plan.length} parte(s): use parte de 0 a ${plan.length - 1}.` }, { status: 400 })
  }

  const { data: blob, error: downloadError } = await supabase.storage.from(BUCKET).download(document.storage_path)
  if (downloadError || !blob) {
    return NextResponse.json({ ok: false, error: 'Não foi possível baixar o PDF do armazenamento.' }, { status: 500 })
  }

  const thinking = params.get('raciocinio') ?? undefined
  const result = await analyzePdfChunk(new Uint8Array(await blob.arrayBuffer()), document.pages, range, { thinkingLevel: thinking })
  const info = { id: document.id, nome: document.name, paginas: document.pages }
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error, detalhe: result.detail ?? null, documento: info }, { status: 502 })
  }

  return NextResponse.json({
    ok: true,
    documento: info,
    partes: plan.map((part) => `${part.index}: páginas ${part.start}-${part.end}`),
    parteAnalisada: range.index,
    modelo: result.model,
    raciocinio: thinking ?? process.env.GEMINI_THINKING_LEVEL ?? 'padrão do modelo',
    duracaoMs: result.durationMs,
    tokens: result.tokens,
    avisos: result.warnings,
    totalItens: result.items.length,
    itens: result.items.map((item) => `[${item.section}] ${item.label}: ${item.value} (p. ${item.page})`),
    itensCompletos: result.items,
  })
}
