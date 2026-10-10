import 'server-only'

import { ApiError } from '@google/genai'

import { createGemini, geminiFallbackModel, geminiModel } from '@/lib/gemini'
import { preparePdfForExtraction } from '@/lib/pdf-slice'
import {
  EXTRACTION_RESPONSE_SCHEMA,
  EXTRACTION_SYSTEM_INSTRUCTION,
  EXTRACTION_USER_PROMPT,
  normalizeExtraction,
  type ProcessExtraction,
} from '@/lib/process-extraction'

// Fase 9B: manda o PDF ao Gemini e devolve os campos do processo JÁ CONFERIDOS pelas regras
// de lib/process-extraction.ts. Só roda no servidor. Nada aqui grava no banco: quem chama
// decide o que fazer com o resultado (na 9C, pré-preencher o formulário para o advogado revisar).

export type ExtractionResult =
  | {
      ok: true
      extraction: ProcessExtraction
      model: string
      pagesSent: number
      totalPages: number
      durationMs: number
      tokens: { input: number | null; output: number | null }
    }
  // detail: motivo técnico, só para a rota de teste do Administrador (nunca mostrar a usuário comum).
  | { ok: false; error: string; detail?: string }

// Texto curto do erro técnico, com a chave de API apagada caso apareça por engano.
function technicalDetail(error: unknown) {
  const key = process.env.GEMINI_API_KEY?.trim()
  let text = error instanceof Error ? `${error.name}: ${error.message}` : String(error)
  if (key) text = text.split(key).join('***')
  return text.slice(0, 600)
}

// Erros passageiros do Gemini (sobrecarga, limite por minuto, falha interna): vale tentar de novo.
function isTemporary(error: unknown) {
  return error instanceof ApiError && [429, 500, 503, 504].includes(error.status)
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Limite total da leitura, abaixo dos 60 s da função na Vercel (maxDuration da rota).
const TOTAL_BUDGET_MS = 52_000
// Pausas entre tentativas: 2 s e 4 s. Tenta no máximo 3 vezes.
const RETRY_DELAYS_MS = [2_000, 4_000]

// Hoje em Brasília (AAAA-MM-DD).
export function todayInBrazil() {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' })
}

function toBase64(bytes: Uint8Array) {
  return Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength).toString('base64')
}

export async function extractProcessFromPdf(bytes: Uint8Array, totalPages: number): Promise<ExtractionResult> {
  const startedAt = Date.now()

  let prepared
  try {
    prepared = await preparePdfForExtraction(bytes, totalPages)
  } catch (error) {
    console.error('Falha ao preparar o PDF para leitura:', error)
    return { ok: false, error: 'Não foi possível preparar este PDF para a leitura automática.' }
  }
  if (!prepared) {
    return { ok: false, error: 'O PDF é pesado demais para a leitura automática. Cadastre o processo manualmente.' }
  }

  const primary = geminiModel()
  const fallback = geminiFallbackModel()
  // 1ª e 2ª tentativas no modelo principal; a 3ª no reserva, se houver um configurado.
  const models = [primary, primary, fallback && fallback !== primary ? fallback : primary]

  let model = primary
  let text: string | undefined
  let tokens = { input: null as number | null, output: null as number | null }
  let lastError: unknown = null

  for (let attempt = 0; attempt < models.length; attempt++) {
    const remaining = TOTAL_BUDGET_MS - (Date.now() - startedAt)
    if (remaining < 5_000) break
    model = models[attempt]

    try {
      const response = await createGemini().models.generateContent({
        model,
        contents: [
          {
            role: 'user',
            parts: [
              { inlineData: { mimeType: 'application/pdf', data: toBase64(prepared.bytes) } },
              { text: EXTRACTION_USER_PROMPT },
            ],
          },
        ],
        config: {
          systemInstruction: EXTRACTION_SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          responseJsonSchema: EXTRACTION_RESPONSE_SCHEMA,
          // Extração, não criação: queremos a mesma resposta sempre que possível.
          temperature: 0,
          // Se travar, corta a tentativa antes de estourar o limite da função na Vercel.
          abortSignal: AbortSignal.timeout(remaining),
        },
      })
      text = response.text
      tokens = {
        input: response.usageMetadata?.promptTokenCount ?? null,
        output: response.usageMetadata?.candidatesTokenCount ?? null,
      }
      lastError = null
      break
    } catch (error) {
      lastError = error
      // O detalhe técnico fica nos logs da Vercel; a tela mostra só o essencial.
      console.error(`Falha na leitura do PDF pelo Gemini (tentativa ${attempt + 1}, modelo ${model}):`, error)
      if (!isTemporary(error) || attempt === models.length - 1) break
      await wait(RETRY_DELAYS_MS[attempt] ?? 4_000)
    }
  }

  if (lastError) {
    return {
      ok: false,
      error: isTemporary(lastError)
        ? 'O Gemini está sobrecarregado neste momento. Tente de novo em alguns minutos.'
        : 'O Gemini não conseguiu ler o documento agora. Tente de novo em instantes.',
      detail: technicalDetail(lastError),
    }
  }

  if (!text) return { ok: false, error: 'O Gemini não devolveu resposta para este documento.' }

  let raw: unknown
  try {
    raw = JSON.parse(text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, ''))
  } catch {
    console.error('Resposta do Gemini não é JSON válido:', text.slice(0, 300))
    return { ok: false, error: 'A resposta do Gemini veio em formato inesperado. Tente de novo.' }
  }

  const extraction = normalizeExtraction(raw, { pagesSent: prepared.pagesSent, today: todayInBrazil() })

  return {
    ok: true,
    extraction,
    model,
    pagesSent: prepared.pagesSent,
    totalPages,
    durationMs: Date.now() - startedAt,
    tokens,
  }
}
