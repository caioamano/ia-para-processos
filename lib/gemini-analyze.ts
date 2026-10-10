import 'server-only'

import {
  ANALYSIS_RESPONSE_SCHEMA,
  ANALYSIS_SYSTEM_INSTRUCTION,
  ANALYSIS_USER_PROMPT,
  normalizeAnalysis,
  type AnalysisDraftItem,
  type PageRange,
} from '@/lib/document-analysis'
import { generateJsonFromPdf } from '@/lib/gemini-call'
import { slicePdfPages } from '@/lib/pdf-slice'

export type AnalyzeChunkResult =
  | {
      ok: true
      items: AnalysisDraftItem[]
      warnings: string[]
      model: string
      durationMs: number
      tokens: { input: number | null; output: number | null }
    }
  | { ok: false; error: string; detail?: string }

// Fase 10: analisa UMA parte (intervalo de páginas) de um PDF e devolve os itens já conferidos.
// Só roda no servidor e não grava nada: quem chama decide o que fazer com os itens.
export async function analyzePdfChunk(bytes: Uint8Array, totalPages: number, range: PageRange): Promise<AnalyzeChunkResult> {
  const startedAt = Date.now()

  let part: Uint8Array | null
  try {
    part = await slicePdfPages(bytes, totalPages, range.start, range.end - range.start + 1)
  } catch (error) {
    console.error('Falha ao recortar o PDF para análise:', error)
    return { ok: false, error: 'Não foi possível preparar este PDF para a análise.' }
  }
  if (!part) return { ok: false, error: 'Este trecho do PDF é pesado demais para a análise automática.' }

  const result = await generateJsonFromPdf({
    pdf: part,
    system: ANALYSIS_SYSTEM_INSTRUCTION,
    prompt: ANALYSIS_USER_PROMPT,
    schema: ANALYSIS_RESPONSE_SCHEMA,
  })
  if (!result.ok) return { ok: false, error: result.error, detail: result.detail }

  let raw: unknown
  try {
    raw = JSON.parse(result.text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, ''))
  } catch {
    console.error('Resposta do Gemini (análise) não é JSON válido:', result.text.slice(0, 300))
    return { ok: false, error: 'A resposta do Gemini veio em formato inesperado. Tente de novo.' }
  }

  const { items, warnings } = normalizeAnalysis(raw, range)
  return { ok: true, items, warnings, model: result.model, durationMs: Date.now() - startedAt, tokens: result.tokens }
}
