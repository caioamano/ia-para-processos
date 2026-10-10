import 'server-only'

import { GoogleGenAI } from '@google/genai'

// Conexão com o Gemini. Este arquivo só roda no SERVIDOR ('server-only' faz o build falhar
// se alguém importar isto num componente do navegador). A chave da API NUNCA vai ao navegador.
//
// Variáveis na Vercel (Settings > Environment Variables):
//   GEMINI_API_KEY  (obrigatória) chave criada no Google AI Studio
//   GEMINI_MODEL    (opcional)    nome do modelo; se vazio, usa o padrão abaixo
//   GEMINI_FALLBACK_MODEL (opcional) modelo reserva, usado na 3ª tentativa se o principal estiver sobrecarregado
export const DEFAULT_GEMINI_MODEL = 'gemini-3.5-flash'

export function geminiModel() {
  return process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL
}

export function geminiFallbackModel() {
  return process.env.GEMINI_FALLBACK_MODEL?.trim() || null
}

export function geminiConfigured() {
  return Boolean(process.env.GEMINI_API_KEY?.trim())
}

export function createGemini() {
  const apiKey = process.env.GEMINI_API_KEY?.trim()
  if (!apiKey) throw new Error('GEMINI_API_KEY não configurada.')
  return new GoogleGenAI({ apiKey })
}
