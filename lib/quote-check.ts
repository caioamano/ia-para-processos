// Fase 12: conferência de trechos. Este arquivo NÃO lê PDF, não fala com o Gemini nem com o banco:
// só compara textos. Pergunta que ele responde: "este trecho citado está de fato nesta página?"
// (a extração do texto das páginas fica em lib/pdf-text.ts).

export type QuoteCheck = 'verified' | 'corrected' | 'unverifiable' | 'unconfirmed'

export interface QuoteCheckResult {
  check: QuoteCheck
  // Página em que o trecho foi realmente achado (igual à citada, ou a corrigida).
  page: number
}

// Texto de cada página do PDF, na ordem (índice 0 = página 1).
export type PageTexts = string[]

// Abaixo disto, o PDF inteiro é tratado como "sem texto" (escaneado): não dá para conferir.
const MIN_TEXT_CHARS = 40
// Trecho curto demais só vale se aparecer inteiro; trecho maior aceita pequenas diferenças.
const MIN_WORDS_FOR_FUZZY = 6
const FUZZY_THRESHOLD = 0.85

// Deixa dois textos comparáveis: sem acento, minúsculo, aspas e traços padronizados, e qualquer
// sequência de símbolos/espaços/quebras de linha vira um espaço só. O PDF quebra linhas e hifeniza
// de um jeito, o Gemini copia de outro; a comparação não pode depender disso.
export function normalizeForMatch(text: string) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9$%]+/g, ' ')
    .trim()
}

function wordTriples(words: string[]) {
  const triples: string[] = []
  for (let i = 0; i + 2 < words.length; i++) triples.push(`${words[i]} ${words[i + 1]} ${words[i + 2]}`)
  return triples
}

// Fração das sequências de 3 palavras do trecho que aparecem na página (0 a 1).
function containment(quoteWords: string[], pageNormalized: string) {
  const triples = wordTriples(quoteWords)
  if (triples.length === 0) return 0
  const padded = ` ${pageNormalized} `
  const found = triples.filter((triple) => padded.includes(` ${triple} `)).length
  return found / triples.length
}

export function pdfHasTextLayer(pages: PageTexts) {
  return pages.join('').replace(/\s+/g, '').length >= MIN_TEXT_CHARS
}

function matchesPage(quoteNormalized: string, quoteWords: string[], pageNormalized: string) {
  if (pageNormalized === '') return false
  if (` ${pageNormalized} `.includes(` ${quoteNormalized} `)) return true
  if (quoteWords.length < MIN_WORDS_FOR_FUZZY) return false
  return containment(quoteWords, pageNormalized) >= FUZZY_THRESHOLD
}

// Confere um trecho contra a página citada; se não estiver lá, procura nas outras páginas do MESMO
// documento (o Gemini às vezes erra a página por uma). Resultados:
//   verified     o trecho está na página citada
//   corrected    estava em outra página: `page` traz a correta
//   unverifiable o PDF não tem texto selecionável (escaneado): não dá para conferir
//   unconfirmed  o trecho não foi achado em lugar nenhum do documento (ou veio vazio)
export function checkQuote(quote: string | null, citedPage: number, pages: PageTexts): QuoteCheckResult {
  if (!pdfHasTextLayer(pages)) return { check: 'unverifiable', page: citedPage }

  const quoteNormalized = quote ? normalizeForMatch(quote) : ''
  if (quoteNormalized === '') return { check: 'unconfirmed', page: citedPage }
  const quoteWords = quoteNormalized.split(' ')

  const normalizedPages = pages.map(normalizeForMatch)

  if (matchesPage(quoteNormalized, quoteWords, normalizedPages[citedPage - 1] ?? '')) {
    return { check: 'verified', page: citedPage }
  }

  // Procura a mais próxima da citada (empate: a anterior).
  const candidates: number[] = []
  normalizedPages.forEach((pageText, index) => {
    if (index + 1 !== citedPage && matchesPage(quoteNormalized, quoteWords, pageText)) candidates.push(index + 1)
  })
  if (candidates.length > 0) {
    candidates.sort((a, b) => Math.abs(a - citedPage) - Math.abs(b - citedPage) || a - b)
    return { check: 'corrected', page: candidates[0] }
  }
  return { check: 'unconfirmed', page: citedPage }
}
