import { extractText, getDocumentProxy } from 'unpdf'

// Fase 12: extrai o texto de cada página de um PDF (a "camada de texto"). PDF escaneado (só imagem)
// devolve páginas vazias, e quem chama trata isso como "não foi possível conferir".
// Sem 'server-only' e sem Gemini/banco aqui dentro, para dar para testar sozinho.
export async function extractPageTexts(bytes: Uint8Array): Promise<string[] | null> {
  try {
    // unpdf pode "consumir" o buffer; passamos uma cópia para não estragar o arquivo do chamador.
    const pdf = await getDocumentProxy(new Uint8Array(bytes))
    const { text } = await extractText(pdf, { mergePages: false })
    return text
  } catch (error) {
    console.error('Falha ao extrair o texto do PDF:', error instanceof Error ? error.message : error)
    return null
  }
}
