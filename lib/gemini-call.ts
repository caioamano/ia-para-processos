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

// "Please retry in 2h50m44.5s" -> segundos. null se a mensagem não traz o tempo.
function parseRetryDelay(message: string) {
  const match = /retry in (?:(\d+)h)?(?:(\d+)m)?(?:([\d.]+)s)?/i.exec(message)
  if (!match || (!match[1] && !match[2] && !match[3])) return null
  return Number(match[1] ?? 0) * 3600 + Number(match[2] ?? 0) * 60 + Number(match[3] ?? 0)
}

export interface GeminiErrorInfo {
  // Vale tentar de novo agora (sobrecarga passageira)?
  retryable: boolean
  // Acabou a cota (limite de pedidos do plano)?
  quota: boolean
  retryAfterSeconds: number | null
}

// Sobrecarga (503) e falha interna (500/504) passam sozinhas: tentamos de novo. Erro 429 de COTA
// (plano gratuito: poucos pedidos por dia) só passa quando o Google diz que passou, e isso pode levar
// horas: tentar de novo agora só gasta tempo. Só repetimos um 429 se o Google pedir poucos segundos.
export function classifyGeminiError(error: unknown): GeminiErrorInfo {
  if (!(error instanceof ApiError)) return { retryable: false, quota: false, retryAfterSeconds: null }
  const retryAfterSeconds = parseRetryDelay(error.message)
  if (error.status === 429) {
    return {
      retryable: retryAfterSeconds !== null && retryAfterSeconds <= 10,
      quota: /quota|RESOURCE_EXHAUSTED|free_tier/i.test(error.message),
      retryAfterSeconds,
    }
  }
  return { retryable: [500, 503, 504].includes(error.status), quota: false, retryAfterSeconds }
}

function formatWait(seconds: number) {
  if (seconds >= 3600) return `${Math.floor(seconds / 3600)} h ${Math.round((seconds % 3600) / 60)} min`
  if (seconds >= 60) return `${Math.round(seconds / 60)} min`
  return `${Math.ceil(seconds)} s`
}

// Mensagem para a tela, conforme o tipo de falha.
export function geminiFailureMessage(error: unknown) {
  const info = classifyGeminiError(error)
  if (info.quota) {
    const when = info.retryAfterSeconds ? ` (deve liberar em cerca de ${formatWait(info.retryAfterSeconds)})` : ''
    return `O limite de uso do Gemini foi atingido${when}. O plano gratuito permite poucos pedidos por dia; tente mais tarde ou ative o plano pago.`
  }
  if (info.retryable) return 'O Gemini está sobrecarregado neste momento. Tente de novo em alguns minutos.'
  return 'O Gemini não conseguiu ler o documento agora. Tente de novo em instantes.'
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
  const tried: string[] = []
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
      tried.push(`${model}: ${error instanceof ApiError ? error.status : 'erro'}`)
      console.error(`Falha na chamada ao Gemini (tentativa ${attempt + 1}, modelo ${model}):`, error)
      if (!classifyGeminiError(error).retryable || attempt === models.length - 1) break
      await wait(RETRY_DELAYS_MS[attempt] ?? 4_000)
    }
  }

  return {
    ok: false,
    error: geminiFailureMessage(lastError),
    detail: `${technicalDetail(lastError)} | Tentativas: ${tried.join(', ') || 'nenhuma'}`,
  }
}
