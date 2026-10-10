import { PDFDocument } from 'pdf-lib'

// Prepara o PDF para o Gemini ler. Em processos grandes (autos completos) os dados de
// cadastro (número, partes, vara, valor da causa, distribuição) estão no começo, então
// mandamos só as primeiras páginas: a leitura fica mais rápida e mais barata, e o arquivo
// cabe no pedido. A numeração das páginas não muda (a página 1 continua sendo a 1).
//
// Sem 'server-only' e sem Gemini aqui dentro, para dar para testar sozinho.

export const EXTRACTION_PAGE_STEPS = [40, 15, 5] as const
export const MAX_INLINE_BYTES = 15 * 1024 * 1024

export interface PreparedPdf {
  bytes: Uint8Array
  pagesSent: number
}

export async function preparePdfForExtraction(bytes: Uint8Array, totalPages: number): Promise<PreparedPdf | null> {
  let source: PDFDocument | null = null

  for (const step of EXTRACTION_PAGE_STEPS) {
    const pagesSent = Math.min(step, totalPages)

    if (pagesSent === totalPages) {
      if (bytes.length <= MAX_INLINE_BYTES) return { bytes, pagesSent }
    } else {
      source ??= await PDFDocument.load(bytes, { ignoreEncryption: true, updateMetadata: false })
      const slice = await PDFDocument.create()
      const pages = await slice.copyPages(
        source,
        Array.from({ length: pagesSent }, (_, index) => index),
      )
      for (const page of pages) slice.addPage(page)
      const sliced = await slice.save()
      if (sliced.length <= MAX_INLINE_BYTES) return { bytes: sliced, pagesSent }
    }
  }

  // Nem com poucas páginas coube: PDF pesado demais (provavelmente escaneado em alta resolução).
  return null
}
