'use server'

import { PDFDocument } from 'pdf-lib'

import { getSession } from '@/lib/data/queries'
import { looksLikePdf, MAX_FILE_BYTES, UUID_PATTERN } from '@/lib/documents'
import { extractProcessFromPdf } from '@/lib/gemini-extract'
import { geminiConfigured } from '@/lib/gemini'
import type { ProcessExtraction } from '@/lib/process-extraction'
import { draftStoragePath } from '@/lib/process-prefill'
import { createClient } from '@/lib/supabase/server'

export type ReadPdfResult =
  | { ok: true; extraction: ProcessExtraction; pagesSent: number; totalPages: number }
  | { ok: false; error: string }

// "Cadastrar a partir do PDF", passo 1: o navegador já enviou o PDF direto para o Storage
// (pasta de rascunhos do escritório). Aqui o SERVIDOR baixa o arquivo, confere que é PDF de
// verdade e pede ao Gemini para ler os dados. Não grava nada no banco: o resultado só volta
// para a tela, onde o advogado confere e confirma.
//
// O caminho é montado com o escritório da SESSÃO: não dá para ler o rascunho de outro escritório.
export async function readDraftPdf(draftId: string): Promise<ReadPdfResult> {
  const session = await getSession()
  if (!session) return { ok: false, error: 'Sua sessão expirou. Entre novamente.' }
  if (session.user.role === 'Estagiário') {
    return { ok: false, error: 'Você não tem permissão para cadastrar processos.' }
  }
  if (!UUID_PATTERN.test(draftId)) return { ok: false, error: 'Pedido inválido.' }
  if (!geminiConfigured()) return { ok: false, error: 'A leitura automática ainda não está configurada.' }

  const supabase = await createClient()
  const { data: blob, error } = await supabase.storage
    .from('documents')
    .download(draftStoragePath(session.office.id, draftId))
  if (error || !blob) return { ok: false, error: 'Não encontramos o arquivo enviado. Tente enviar de novo.' }

  if (blob.size === 0 || blob.size > MAX_FILE_BYTES) return { ok: false, error: 'O arquivo está vazio ou passa de 50 MB.' }

  const bytes = new Uint8Array(await blob.arrayBuffer())
  if (!looksLikePdf(bytes)) return { ok: false, error: 'O arquivo não é um PDF válido.' }

  let totalPages: number
  try {
    const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true, updateMetadata: false })
    totalPages = pdf.getPageCount()
  } catch {
    return { ok: false, error: 'Não foi possível ler este PDF. Ele pode estar corrompido.' }
  }
  if (totalPages < 1) return { ok: false, error: 'O PDF não tem páginas.' }

  const result = await extractProcessFromPdf(bytes, totalPages)
  if (!result.ok) return { ok: false, error: result.error }

  return { ok: true, extraction: result.extraction, pagesSent: result.pagesSent, totalPages }
}
