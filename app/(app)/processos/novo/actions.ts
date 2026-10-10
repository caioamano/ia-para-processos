'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { registerDocument } from '@/app/(app)/processos/[id]/documentos-actions'
import { getSession } from '@/lib/data/queries'
import { documentStoragePath, UUID_PATTERN } from '@/lib/documents'
import { todayInSaoPaulo } from '@/lib/format'
import { EMPTY_FORM_VALUES, validateProcessForm, type FormState } from '@/lib/process-form'
import { draftStoragePath } from '@/lib/process-prefill'
import { createClient } from '@/lib/supabase/server'

// Quando o processo nasceu de um PDF ("Cadastrar a partir do PDF"), o arquivo estava num
// rascunho. Aqui ele é COPIADO para o caminho definitivo, registrado como documento do processo
// (com a mesma conferência de sempre) e o rascunho é apagado. Se algo falhar, o processo já
// existe: devolve false e a tela avisa para enviar o PDF de novo.
async function attachDraftPdf(
  supabase: Awaited<ReturnType<typeof createClient>>,
  officeId: string,
  processId: string,
  draftId: string,
  fileName: string,
) {
  const draftPath = draftStoragePath(officeId, draftId)
  const documentId = crypto.randomUUID()

  const { error: copyError } = await supabase.storage
    .from('documents')
    .copy(draftPath, documentStoragePath(officeId, processId, documentId))
  if (copyError) {
    console.error('Falha ao copiar o rascunho para o processo:', copyError.message)
    return false
  }

  const registered = await registerDocument(processId, documentId, fileName)
  if (!registered.ok) {
    console.error('Falha ao registrar o PDF do rascunho:', registered.error)
    return false
  }

  // Limpeza do rascunho (melhor esforço: se falhar, só sobra um arquivo sem uso).
  await supabase.storage.from('documents').remove([draftPath])
  return true
}

// Esta função roda no SERVIDOR quando o formulário é enviado.
// Três camadas protegem o cadastro:
//   1. aqui: confere o login, a função da pessoa e cada campo;
//   2. o banco (RLS): só Administrador e Advogado inserem, e só no próprio escritório;
//   3. a chave composta do banco: o responsável precisa ser do mesmo escritório.
export async function createProcess(_previous: FormState, formData: FormData): Promise<FormState> {
  const session = await getSession()
  if (!session) {
    return { error: 'Sua sessão expirou. Entre novamente.', values: EMPTY_FORM_VALUES }
  }

  const checked = validateProcessForm(formData, todayInSaoPaulo())
  if (!checked.ok) {
    return { fieldErrors: checked.fieldErrors, values: checked.values }
  }

  if (session.user.role === 'Estagiário') {
    return { error: 'Você não tem permissão para cadastrar processos.', values: checked.values }
  }

  const { data } = checked
  const supabase = await createClient()

  // O escritório vem da SESSÃO, nunca do formulário: ninguém escolhe em qual escritório grava.
  const { data: created, error } = await supabase
    .from('processes')
    .insert({
      office_id: session.office.id,
      number: data.number,
      client: data.client,
      type: data.type,
      status: data.status,
      responsible_id: data.responsibleId,
      counterparty: data.counterparty,
      court: data.court,
      case_value: data.caseValue,
      distributed_at: data.distributedAt,
    })
    .select('id')
    .single()

  if (error) {
    // 23505 = número repetido no escritório; 23503 = responsável inválido; 42501 = RLS negou.
    if (error.code === '23505') {
      return { fieldErrors: { number: 'Já existe um processo com esse número no escritório.' }, values: checked.values }
    }
    if (error.code === '23503') {
      return { fieldErrors: { responsibleId: 'Escolha um responsável do seu escritório.' }, values: checked.values }
    }
    if (error.code === '42501') {
      return { error: 'Você não tem permissão para cadastrar processos.', values: checked.values }
    }
    console.error('Falha ao cadastrar processo:', error.code, error.message)
    return { error: 'Não foi possível cadastrar o processo. Tente novamente.', values: checked.values }
  }

  // Veio de "Cadastrar a partir do PDF"? Anexa o PDF do rascunho ao processo recém-criado.
  const draftId = formData.get('draftId')
  const draftFileName = formData.get('draftFileName')
  let pdfAttached: boolean | null = null
  if (typeof draftId === 'string' && UUID_PATTERN.test(draftId)) {
    const fileName = typeof draftFileName === 'string' && draftFileName.trim() !== '' ? draftFileName : 'documento.pdf'
    pdfAttached = await attachDraftPdf(supabase, session.office.id, created.id, draftId, fileName)
  }

  // As listas guardam dados em cache: avisa que mudaram. Depois abre o processo novo.
  revalidatePath('/processos')
  revalidatePath('/dashboard')
  redirect(`/processos/${created.id}?cadastrado=1${pdfAttached === false ? '&pdf=erro' : ''}`)
}
