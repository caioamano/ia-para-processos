'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { getSession } from '@/lib/data/queries'
import { todayInSaoPaulo } from '@/lib/format'
import { EMPTY_FORM_VALUES, validateProcessForm, type FormState } from '@/lib/process-form'
import { createClient } from '@/lib/supabase/server'

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

  // As listas guardam dados em cache: avisa que mudaram. Depois abre o processo novo.
  revalidatePath('/processos')
  revalidatePath('/dashboard')
  redirect(`/processos/${created.id}?cadastrado=1`)
}
