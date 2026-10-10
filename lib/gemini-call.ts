import 'server-only'

import { ApiError, ThinkingLevel } from '@google/genai'

import { createGemini, geminiFallbackModel, geminiModel } from '@/lib/gemini'

// Chamada ao Gemini com um PDF e resposta em JSON, com tentativas automáticas quando o modelo
// está sobrecarregado (mesma regra de lib/gemini-extract.ts, usada pela análise da Fase 10).

export type GeminiJsonResult =
  | { ok: true; text: string; model: string; tokens: { input: number | null; output: number | null; thinking: number | null } }
  // detail: motivo técnico, só para as rotas de teste do Administrador.
  | { ok: false; error: string; detail: string }

const TOTAL_BUDGET_MS = 52_000
const RETRY_DELAYS_MS = [2_000, 4_000]

// Nível de "raciocínio" do modelo: mais baixo = resposta mais rápida. Vem do pedido ou da variável
// opcional GEMINI_THINKING_LEVEL (minimal, low, medium ou high). Vazio ou inválido = padrão do modelo.
const THINKING_LEVELS: Record<string, ThinkingLevel> = {
  minimal: ThinkingLevel.MINIMAL,
  low: ThinkingLevel.LOW,
  medium: ThinkingLevel.MEDIUM,
  high: ThinkingLevel.HIGH,
}

function resolveThinkingLevel(requested?: string) {
  const wanted = (requested ?? process.env.GEMINI_THINKING_LEVEL ?? '').trim().toLowerCase()
  return THINKING_LEVELS[wanted]
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function isTemporary(error: unknown) {
  return error instanceof ApiError && [429, 500, 503, 504].includes(error.status)
}

function technicalDetail(error: unknown) {
  const key = process.env.GEMINI_API_KEY?.trim()
  let text = error instanceof Error ? `${error.name}: ${error.message}` : String(error)
  if (key) text = text.split(key).join('***')
  return text.slice(0, 600)
}

export async function generateJsonFromPdf(options: {
  pdf: Uint8Array
  system: string
  prompt: string
  schema: unknown
  maxOutputTokens?: number
  thinkingLevel?: string
}): Promise<GeminiJsonResult> {
  const startedAt = Date.now()
  const primary = geminiModel()
  const fallback = geminiFallbackModel()
  const models = [primary, primary, fallback && fallback !== primary ? fallback : primary]
  const thinkingLevel = resolveThinkingLevel(options.thinkingLevel)
  const data = Buffer.from(options.pdf.buffer, options.pdf.byteOffset, options.pdf.byteLength).toString('base64')

  let lastError: unknown = null
  for (let attempt = 0; attempt < models.length; attempt++) {
    const remaining = TOTAL_BUDGET_MS - (Date.now() - startedAt)
    if (remaining < 5_000) break
    const model = models[attempt]

    try {
      const response = await createGemini().models.generateContent({
        model,
        contents: [
          {
            role: 'user',
            parts: [{ inlineData: { mimeType: 'application/pdf', data } }, { text: options.prompt }],
          },
        ],
        config: {
          systemInstruction: options.system,
          responseMimeType: 'application/json',
          responseJsonSchema: options.schema,
          temperature: 0,
          maxOutputTokens: options.maxOutputTokens ?? 8192,
          ...(thinkingLevel ? { thinkingConfig: { thinkingLevel } } : {}),
          abortSignal: AbortSignal.timeout(remaining),
        },
      })
      if (!response.text) return { ok: false, error: 'O Gemini não devolveu resposta para este trecho.', detail: 'resposta vazia' }
      return {
        ok: true,
        text: response.text,
        model,
        tokens: {
          input: response.usageMetadata?.promptTokenCount ?? null,
          output: response.usageMetadata?.candidatesTokenCount ?? null,
          thinking: response.usageMetadata?.thoughtsTokenCount ?? null,
        },
      }
    } catch (error) {
      lastError = error
      console.error(`Falha na chamada ao Gemini (tentativa ${attempt + 1}, modelo ${model}):`, error)
      if (!isTemporary(error) || attempt === models.length - 1) break
      await wait(RETRY_DELAYS_MS[attempt] ?? 4_000)
    }
  }

  return {
    ok: false,
    error: isTemporary(lastError)
      ? 'O Gemini está sobrecarregado neste momento. Tente de novo em alguns minutos.'
      : 'O Gemini não conseguiu ler o documento agora. Tente de novo em instantes.',
    detail: technicalDetail(lastError),
  }
}
