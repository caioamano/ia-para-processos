import 'server-only'

import { generateJsonFromPdf } from '@/lib/gemini-call'
import {
  buildQaDocumentLabel,
  buildQaUserPrompt,
  normalizeAnswer,
  QA_RESPONSE_SCHEMA,
  QA_SYSTEM_INSTRUCTION,
  type QaAnswer,
  type QaDocument,
} from '@/lib/process-qa'

export type AnswerResult =
  | { ok: true; answer: QaAnswer; model: string; durationMs: number; tokens: { input: number | null; output: number | null; thinking: number | null } }
  | { ok: false; error: string; detail?: string }

// Fase 11: manda os documentos do processo e a pergunta ao Gemini e devolve a resposta JÁ CONFERIDA
// por lib/process-qa.ts. Só roda no servidor e não grava nada: quem chama decide o que fazer.
export async function answerFromDocuments(
  documents: Array<{ meta: QaDocument; bytes: Uint8Array }>,
  question: string,
): Promise<AnswerResult> {
  const startedAt = Date.now()

  const result = await generateJsonFromPdf({
    documents: documents.map((document, index) => ({
      label: buildQaDocumentLabel(index + 1, document.meta),
      pdf: document.bytes,
    })),
    system: QA_SYSTEM_INSTRUCTION,
    prompt: buildQaUserPrompt(question),
    schema: QA_RESPONSE_SCHEMA,
    maxOutputTokens: 2048,
    // Mesmo padrão da análise: raciocínio baixo é bem mais rápido. GEMINI_THINKING_LEVEL troca.
    thinkingLevel: process.env.GEMINI_THINKING_LEVEL ?? 'low',
  })
  if (!result.ok) return { ok: false, error: result.error, detail: result.detail }

  let raw: unknown
  try {
    raw = JSON.parse(result.text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, ''))
  } catch {
    console.error('Resposta do Gemini (pergunta) não é JSON válido:', result.text.slice(0, 300))
    return { ok: false, error: 'A resposta do Gemini veio em formato inesperado. Tente de novo.' }
  }

  return {
    ok: true,
    answer: normalizeAnswer(raw, documents.map((document) => document.meta)),
    model: result.model,
    durationMs: Date.now() - startedAt,
    tokens: result.tokens,
  }
}
