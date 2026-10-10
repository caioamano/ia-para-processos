'use server'

import { revalidatePath } from 'next/cache'
import { PDFDocument } from 'pdf-lib'

import { getSession } from '@/lib/data/queries'
import {
  cleanFileName,
  displayNameFromFile,
  documentStoragePath,
  looksLikePdf,
  MAX_FILE_BYTES,
  UUID_PATTERN,
} from '@/lib/documents'
import { createClient } from '@/lib/supabase/server'

export type DocumentActionResult = { ok: true } | { ok: false; error: string }

const BUCKET = 'documents'

function refresh(processId: string) {
  revalidatePath(`/processos/${processId}`)
  revalidatePath('/documentos')
  revalidatePath('/dashboard')
}

// O navegador envia o PDF DIRETO para o Storage (o servidor da Vercel só aceita ~4,5 MB por
// pedido, pouco para um processo). Depois chama esta função, que CONFERE o arquivo de verdade
// e só então registra o documento no banco. O caminho é montado aqui, com o escritório da
// sessão: o navegador não escolhe onde o arquivo fica.
export async function registerDocument(
  processId: string,
  documentId: string,
  fileName: string,
): Promise<DocumentActionResult> {
  const session = await getSession()
  if (!session) return { ok: false, error: 'Sua sessão expirou. Entre novamente.' }

  if (!UUID_PATTERN.test(processId) || !UUID_PATTERN.test(documentId)) {
    return { ok: false, error: 'Pedido inválido.' }
  }

  const supabase = await createClient()

  // O processo precisa existir e ser do escritório da pessoa (o RLS esconde os de outros).
  const { data: process } = await supabase.from('processes').select('id').eq('id', processId).maybeSingle()
  if (!process) return { ok: false, error: 'Processo não encontrado.' }

  const path = documentStoragePath(session.office.id, processId, documentId)

  // Se algo der errado daqui em diante, tenta apagar o arquivo enviado (sem arquivo
  // órfão). Para estagiário o Storage nega a exclusão; nesse caso o arquivo fica sem uso.
  const discard = async () => {
    await supabase.storage.from(BUCKET).remove([path])
  }

  const { data: blob, error: downloadError } = await supabase.storage.from(BUCKET).download(path)
  if (downloadError || !blob) {
    return { ok: false, error: 'Não encontramos o arquivo enviado. Tente novamente.' }
  }

  if (blob.size === 0 || blob.size > MAX_FILE_BYTES) {
    await discard()
    return { ok: false, error: 'O arquivo está vazio ou passa de 50 MB.' }
  }

  const bytes = new Uint8Array(await blob.arrayBuffer())
  if (!looksLikePdf(bytes)) {
    await discard()
    return { ok: false, error: 'O arquivo não é um PDF válido.' }
  }

  let pages: number
  try {
    const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true, updateMetadata: false })
    pages = pdf.getPageCount()
  } catch {
    await discard()
    return { ok: false, error: 'Não foi possível ler este PDF. Ele pode estar corrompido.' }
  }
  if (pages < 1) {
    await discard()
    return { ok: false, error: 'O PDF não tem páginas.' }
  }

  const { error: insertError } = await supabase.from('documents').insert({
    id: documentId,
    office_id: session.office.id,
    process_id: processId,
    name: displayNameFromFile(fileName),
    file_name: cleanFileName(fileName),
    pages,
    size_bytes: bytes.length,
    storage_path: path,
    status: 'Pendente',
    uploaded_by: session.user.id,
  })

  if (insertError) {
    await discard()
    if (insertError.code === '23505') return { ok: false, error: 'Este arquivo já foi registrado.' }
    console.error('Falha ao registrar documento:', insertError.code, insertError.message)
    return { ok: false, error: 'Não foi possível registrar o documento. Tente novamente.' }
  }

  refresh(processId)
  return { ok: true }
}

// Exclui o documento (linha no banco + arquivo). Só Administrador e Advogado: o banco
// também exige isso. As análises e consultas que citavam o documento ficam, sem a fonte.
export async function deleteDocument(documentId: string): Promise<DocumentActionResult> {
  const session = await getSession()
  if (!session) return { ok: false, error: 'Sua sessão expirou. Entre novamente.' }
  if (session.user.role === 'Estagiário') {
    return { ok: false, error: 'Você não tem permissão para excluir documentos.' }
  }
  if (!UUID_PATTERN.test(documentId)) return { ok: false, error: 'Pedido inválido.' }

  const supabase = await createClient()

  const { data: document } = await supabase
    .from('documents')
    .select('id, process_id, storage_path')
    .eq('id', documentId)
    .maybeSingle()
  if (!document) return { ok: false, error: 'Documento não encontrado.' }

  const { data: deleted, error } = await supabase.from('documents').delete().eq('id', documentId).select('id')
  if (error || !deleted || deleted.length === 0) {
    return { ok: false, error: 'Não foi possível excluir o documento.' }
  }

  if (document.storage_path) {
    const { error: removeError } = await supabase.storage.from(BUCKET).remove([document.storage_path])
    if (removeError) console.error('Documento excluído, mas o arquivo ficou no Storage:', removeError.message)
  }

  refresh(document.process_id)
  return { ok: true }
}
