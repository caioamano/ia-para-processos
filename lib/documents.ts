// Regras de arquivos de documentos. Sem React e sem banco: fácil de ler e de testar.

// Limite por arquivo. Também é o limite do bucket no Supabase (plano gratuito: 50 MB).
export const MAX_FILE_BYTES = 50 * 1024 * 1024

// Onde cada PDF fica no Storage: <escritório>/<processo>/<documento>.pdf
// A primeira pasta é o escritório: é nela que as regras (RLS) do Storage se baseiam
// para um escritório nunca enxergar os arquivos do outro.
export function documentStoragePath(officeId: string, processId: string, documentId: string) {
  return `${officeId}/${processId}/${documentId}.pdf`
}

export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Um PDF de verdade tem "%PDF-" no começo (o padrão tolera alguns bytes antes, até 1024).
// Não confiamos no nome nem no tipo informado pelo navegador: conferimos o conteúdo.
export function looksLikePdf(bytes: Uint8Array) {
  return new TextDecoder('latin1').decode(bytes.subarray(0, 1024)).includes('%PDF-')
}

// Tira caracteres de controle e barras de um nome de arquivo.
export function cleanFileName(fileName: string) {
  const cleaned = fileName
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .replace(/[\\/]/g, '-')
    .trim()
    .slice(0, 255)
  return cleaned || 'documento.pdf'
}

// "peticao_inicial__v2.pdf" -> "peticao inicial v2" (nome mostrado na tela; dá para renomear depois).
export function displayNameFromFile(fileName: string) {
  const name = cleanFileName(fileName)
    .replace(/\.pdf$/i, '')
    .replace(/_+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 200)
  return name || 'Documento'
}
