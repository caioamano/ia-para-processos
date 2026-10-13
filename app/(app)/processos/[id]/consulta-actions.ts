'use server'

import { revalidatePath } from 'next/cache'

import { getSession } from '@/lib/data/queries'
import { UUID_PATTERN } from '@/lib/documents'
import { geminiConfigured } from '@/lib/gemini'
import { answerFromDocuments } from '@/lib/gemini-qa'
import { pickQaDocuments, QA_MAX_PAGES, validateQuestion, type QaStatus } from '@/lib/process-qa'
import { createClient } from '@/lib/supabase/server'

export type AskResult = { ok: true; status: QaStatus; skipped: string[] } | { ok: false; error: string }

const BUCKET = 'documents'

// Fase 11: "Consultar processo". Qualquer pessoa do escritório pode perguntar (inclusive Estagiário); o banco
// só deixa registrar a consulta em nome da própria pessoa e só do próprio escritório (RLS).
// O servidor baixa os PDFs do processo (a leitura do Storage também passa pelo RLS), manda ao Gemini com a
// pergunta, confere a resposta (fonte obrigatória) e grava o resultado no histórico do processo.
// Cada pergunta é independente: o Gemini não vê as perguntas anteriores.
export async function askAboutProcess(processId: string, questionText: string): Promise<AskResult> {
  const session = await getSession()
  if (!session) return { ok: false, error: 'Sua sessão expirou. Entre novamente.' }
  if (!UUID_PATTERN.test(processId)) return { ok: false, error: 'Pedido inválido.' }

  const validated = validateQuestion(typeof questionText === 'string' ? questionText : '')
  if (!validated.ok) return { ok: false, error: validated.error }
  if (!geminiConfigured()) return { ok: false, error: 'As consultas automáticas ainda não estão configuradas.' }

  const supabase = await createClient()

  const { data: process } = await supabase.from('processes').select('id').eq('id', processId).maybeSingle()
  if (!process) return { ok: false, error: 'Processo não encontrado.' }

  const { data: rows, error: documentsError } = await supabase
    .from('documents')
    .select('id, name, pages, size_bytes, storage_path')
    .eq('process_id', processId)
    .not('storage_path', 'is', null)
    .order('uploaded_at', { ascending: true })
  if (documentsError) {
    console.error('Falha ao listar documentos para a consulta:', documentsError.message)
    return { ok: false, error: 'Não foi possível consultar os documentos do processo.' }
  }
  if (!rows || rows.length === 0) {
    return { ok: false, error: 'Este processo ainda não tem documentos com arquivo. Envie um PDF primeiro.' }
  }

  const { included, skipped } = pickQaDocuments(
    rows.map((row) => ({ id: row.id, name: row.name, pages: row.pages, sizeBytes: row.size_bytes })),
  )
  if (included.length === 0) {
    return { ok: false, error: `Os documentos deste processo são grandes demais para a consulta (limite de ${QA_MAX_PAGES} páginas e 15 MB no total).` }
  }

  const pathById = new Map(rows.map((row) => [row.id, row.storage_path as string]))
  const loaded = await Promise.all(
    included.map(async (meta) => {
      const { data: blob } = await supabase.storage.from(BUCKET).download(pathById.get(meta.id) as string)
      return blob ? { meta, bytes: new Uint8Array(await blob.arrayBuffer()) } : null
    }),
  )
  if (loaded.some((item) => item === null)) {
    return { ok: false, error: 'Não foi possível baixar os documentos do processo.' }
  }

  const result = await answerFromDocuments(loaded as NonNullable<(typeof loaded)[number]>[], validated.question)
  if (!result.ok) return { ok: false, error: result.error }

  const first = result.answer.sources[0]
  const { error: insertError } = await supabase.from('consultations').insert({
    office_id: session.office.id,
    process_id: processId,
    profile_id: session.user.id,
    question: validated.question,
    answer: result.answer.answer,
    source_document_id: first?.documentId ?? null,
    source_page: first?.page ?? null,
    sources: result.answer.sources,
  })
  if (insertError) {
    console.error('Falha ao gravar a consulta:', insertError.message)
    return { ok: false, error: 'A resposta foi gerada, mas não foi possível salvá-la. Tente de novo.' }
  }

  revalidatePath(`/processos/${processId}`)
  return { ok: true, status: result.answer.status, skipped: skipped.map((document) => document.name) }
}
