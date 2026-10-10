'use server'

import { revalidatePath } from 'next/cache'

import { syncAnalysisStatus } from '@/lib/analysis-db'
import { getSession } from '@/lib/data/queries'
import { ANALYSIS_MAX_PAGES, analysisItemKey, planAnalysisChunks } from '@/lib/document-analysis'
import { UUID_PATTERN } from '@/lib/documents'
import { geminiConfigured } from '@/lib/gemini'
import { analyzePdfChunk } from '@/lib/gemini-analyze'
import { createClient } from '@/lib/supabase/server'

// Fase 10B: análise de um documento, em duas etapas que o botão "Analisar" chama em sequência:
//   1) startDocumentAnalysis: prepara (apaga a análise antiga DESTE documento, marca "Em processamento")
//      e diz em quantas partes de 10 páginas o PDF será lido;
//   2) analyzeDocumentPart, uma vez por parte: o servidor lê aquelas páginas com o Gemini, confere os
//      itens e grava. Na última parte o documento vira "Analisado".
// Uma parte por chamada porque cada chamada precisa caber nos 60 s da Vercel.
// Só Administrador e Advogado (o banco também barra os outros).

export type StartAnalysisResult = { ok: true; parts: number } | { ok: false; error: string }
export type AnalysisPartResult = { ok: true; done: boolean; added: number } | { ok: false; error: string }

const BUCKET = 'documents'

type Supabase = Awaited<ReturnType<typeof createClient>>

async function authorize() {
  const session = await getSession()
  if (!session) return { ok: false as const, error: 'Sua sessão expirou. Entre novamente.' }
  if (session.user.role === 'Estagiário') return { ok: false as const, error: 'Você não tem permissão para analisar documentos.' }
  return { ok: true as const, session, supabase: await createClient() }
}

async function loadDocument(supabase: Supabase, documentId: string) {
  const { data } = await supabase
    .from('documents')
    .select('id, process_id, pages, storage_path, status')
    .eq('id', documentId)
    .maybeSingle()
  return data
}

function refresh(processId: string) {
  revalidatePath(`/processos/${processId}`)
  revalidatePath('/processos')
  revalidatePath('/analises')
  revalidatePath('/dashboard')
}

export async function startDocumentAnalysis(documentId: string): Promise<StartAnalysisResult> {
  const auth = await authorize()
  if (!auth.ok) return { ok: false, error: auth.error }
  const { session, supabase } = auth

  if (!UUID_PATTERN.test(documentId)) return { ok: false, error: 'Pedido inválido.' }
  if (!geminiConfigured()) return { ok: false, error: 'A análise automática ainda não está configurada.' }

  const document = await loadDocument(supabase, documentId)
  if (!document) return { ok: false, error: 'Documento não encontrado.' }
  if (!document.storage_path) return { ok: false, error: 'Este documento não tem arquivo para analisar.' }
  if (document.pages > ANALYSIS_MAX_PAGES) {
    return { ok: false, error: `Por enquanto a análise aceita documentos de até ${ANALYSIS_MAX_PAGES} páginas (este tem ${document.pages}).` }
  }

  // Um cabeçalho de análise por processo (unique em process_id): cria se ainda não existe.
  const { data: analysis, error: analysisError } = await supabase
    .from('analyses')
    .upsert({ office_id: session.office.id, process_id: document.process_id }, { onConflict: 'process_id' })
    .select('id')
    .single()
  if (analysisError || !analysis) {
    console.error('Falha ao preparar a análise:', analysisError?.message)
    return { ok: false, error: 'Não foi possível preparar a análise.' }
  }

  // Análise nova substitui a antiga DESTE documento (os itens dos outros documentos ficam).
  await supabase.from('analysis_items').delete().eq('analysis_id', analysis.id).eq('source_document_id', documentId)
  await supabase.from('documents').update({ status: 'Em processamento' }).eq('id', documentId)
  await syncAnalysisStatus(supabase, document.process_id)

  refresh(document.process_id)
  return { ok: true, parts: planAnalysisChunks(document.pages).length }
}

// Falhou no meio: não deixa análise pela metade. Apaga o que já entrou deste documento e o volta a "Pendente".
async function abortAnalysis(supabase: Supabase, documentId: string, processId: string) {
  await supabase.from('analysis_items').delete().eq('source_document_id', documentId)
  await supabase.from('documents').update({ status: 'Pendente' }).eq('id', documentId)
  await syncAnalysisStatus(supabase, processId)
  refresh(processId)
}

export async function analyzeDocumentPart(documentId: string, partIndex: number): Promise<AnalysisPartResult> {
  const auth = await authorize()
  if (!auth.ok) return { ok: false, error: auth.error }
  const { session, supabase } = auth

  if (!UUID_PATTERN.test(documentId) || !Number.isInteger(partIndex) || partIndex < 0) {
    return { ok: false, error: 'Pedido inválido.' }
  }

  const document = await loadDocument(supabase, documentId)
  if (!document?.storage_path) return { ok: false, error: 'Documento não encontrado.' }
  // Só continua uma análise que foi iniciada (evita itens duplicados por chamada solta).
  if (document.status !== 'Em processamento') return { ok: false, error: 'A análise não foi iniciada. Comece de novo.' }

  const plan = planAnalysisChunks(document.pages)
  const range = plan[partIndex]
  if (!range) return { ok: false, error: 'Pedido inválido.' }

  const { data: analysis } = await supabase.from('analyses').select('id').eq('process_id', document.process_id).maybeSingle()
  if (!analysis) return { ok: false, error: 'A análise não foi iniciada. Comece de novo.' }

  const { data: blob, error: downloadError } = await supabase.storage.from(BUCKET).download(document.storage_path)
  if (downloadError || !blob) {
    await abortAnalysis(supabase, documentId, document.process_id)
    return { ok: false, error: 'Não foi possível baixar o PDF do armazenamento.' }
  }

  const result = await analyzePdfChunk(new Uint8Array(await blob.arrayBuffer()), document.pages, range)
  if (!result.ok) {
    await abortAnalysis(supabase, documentId, document.process_id)
    return { ok: false, error: result.error }
  }

  // Não repete o que já entrou deste documento (partes vizinhas podem citar o mesmo fato).
  const { data: existing } = await supabase
    .from('analysis_items')
    .select('section, label, value')
    .eq('analysis_id', analysis.id)
    .eq('source_document_id', documentId)
  const known = new Set((existing ?? []).map((item) => analysisItemKey(item.section, item.label, item.value)))
  const fresh = result.items.filter((item) => !known.has(analysisItemKey(item.section, item.label, item.value)))

  if (fresh.length > 0) {
    const { data: last } = await supabase
      .from('analysis_items')
      .select('position')
      .eq('analysis_id', analysis.id)
      .order('position', { ascending: false })
      .limit(1)
    const base = last?.[0]?.position ?? 0

    const { error: insertError } = await supabase.from('analysis_items').insert(
      fresh.map((item, index) => ({
        office_id: session.office.id,
        analysis_id: analysis.id,
        section: item.section,
        position: base + index + 1,
        label: item.label,
        value: item.value,
        source_document_id: documentId,
        source_page: item.page,
        source_quote: item.quote,
      })),
    )
    if (insertError) {
      console.error('Falha ao gravar os itens da análise:', insertError.message)
      await abortAnalysis(supabase, documentId, document.process_id)
      return { ok: false, error: 'Não foi possível gravar a análise.' }
    }
  }

  const done = partIndex === plan.length - 1
  if (done) await supabase.from('documents').update({ status: 'Analisado' }).eq('id', documentId)
  await syncAnalysisStatus(supabase, document.process_id)
  refresh(document.process_id)

  return { ok: true, done, added: fresh.length }
}
