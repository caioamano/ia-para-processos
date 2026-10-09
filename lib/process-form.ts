import { PROCESS_STATUSES, PROCESS_TYPES } from './types'

// Regras do formulário "Novo processo". Fica num arquivo próprio, sem React nem banco,
// para as regras serem fáceis de ler e de testar.

export const FORM_FIELDS = [
  'number',
  'client',
  'type',
  'status',
  'responsibleId',
  'counterparty',
  'court',
  'caseValue',
  'distributedAt',
] as const

export type FormField = (typeof FORM_FIELDS)[number]

export interface FormState {
  // Erro geral (ex.: sem permissão, falha do banco).
  error?: string
  // Erro de cada campo, mostrado embaixo dele.
  fieldErrors?: Partial<Record<FormField, string>>
  // O que a pessoa digitou, para o formulário não esvaziar quando houver erro.
  values: Record<FormField, string>
}

export const EMPTY_FORM_VALUES: Record<FormField, string> = {
  number: '',
  client: '',
  type: '',
  status: 'Em andamento',
  responsibleId: '',
  counterparty: '',
  court: '',
  caseValue: '',
  distributedAt: '',
}

export interface ProcessInput {
  number: string
  client: string
  type: string
  status: string
  responsibleId: string
  counterparty: string | null
  court: string | null
  caseValue: number | null
  distributedAt: string | null
}

// Numeração única do CNJ: NNNNNNN-DD.AAAA.J.TR.OOOO (20 dígitos).
const CNJ_NUMBER = /^\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}$/
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Aceita o número com ou sem pontuação: se vierem só os 20 dígitos, coloca a máscara.
export function normalizeProcessNumber(text: string) {
  const trimmed = text.trim()
  const digits = trimmed.replace(/\D/g, '')
  if (digits.length === 20 && /^[\d.\-\s]+$/.test(trimmed)) {
    return `${digits.slice(0, 7)}-${digits.slice(7, 9)}.${digits.slice(9, 13)}.${digits.slice(13, 14)}.${digits.slice(14, 16)}.${digits.slice(16, 20)}`
  }
  return trimmed
}

// "85.000,00" ou "85000,5" ou "85000" -> número. Vazio -> null. Inválido -> NaN.
export function parseCaseValue(text: string) {
  const trimmed = text.trim().replace(/^R\$\s*/i, '')
  if (trimmed === '') return null
  if (!/^\d{1,3}(\.\d{3})*(,\d{1,2})?$|^\d+(,\d{1,2})?$/.test(trimmed)) return Number.NaN
  return Number(trimmed.replace(/\./g, '').replace(',', '.'))
}

function isRealDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

// Lê o formulário, confere cada campo e devolve ou os dados limpos ou os erros.
// "today" (AAAA-MM-DD, horário de Brasília) impede data de distribuição no futuro.
export function validateProcessForm(
  formData: FormData,
  today: string,
): { ok: true; data: ProcessInput; values: FormState['values'] } | { ok: false; fieldErrors: NonNullable<FormState['fieldErrors']>; values: FormState['values'] } {
  const values = { ...EMPTY_FORM_VALUES }
  for (const field of FORM_FIELDS) {
    const raw = formData.get(field)
    values[field] = typeof raw === 'string' ? raw.trim() : ''
  }
  values.number = normalizeProcessNumber(values.number)

  const errors: NonNullable<FormState['fieldErrors']> = {}

  if (!CNJ_NUMBER.test(values.number)) {
    errors.number = 'Use o formato 0000000-00.0000.0.00.0000.'
  }
  if (values.client === '') errors.client = 'Informe o nome do cliente.'
  else if (values.client.length > 160) errors.client = 'Use no máximo 160 caracteres.'

  if (!(PROCESS_TYPES as readonly string[]).includes(values.type)) errors.type = 'Escolha o tipo do processo.'
  if (!(PROCESS_STATUSES as readonly string[]).includes(values.status)) errors.status = 'Escolha a situação.'
  if (!UUID.test(values.responsibleId)) errors.responsibleId = 'Escolha o responsável.'

  if (values.counterparty.length > 160) errors.counterparty = 'Use no máximo 160 caracteres.'
  if (values.court.length > 120) errors.court = 'Use no máximo 120 caracteres.'

  const caseValue = parseCaseValue(values.caseValue)
  if (Number.isNaN(caseValue)) errors.caseValue = 'Use um valor como 85.000,00.'
  else if (caseValue !== null && caseValue >= 1e12) errors.caseValue = 'Valor alto demais.'

  if (values.distributedAt !== '') {
    if (!isRealDate(values.distributedAt)) errors.distributedAt = 'Data inválida.'
    else if (values.distributedAt > today) errors.distributedAt = 'A distribuição não pode ser no futuro.'
  }

  if (Object.keys(errors).length > 0) return { ok: false, fieldErrors: errors, values }

  return {
    ok: true,
    values,
    data: {
      number: values.number,
      client: values.client,
      type: values.type,
      status: values.status,
      responsibleId: values.responsibleId,
      counterparty: values.counterparty || null,
      court: values.court || null,
      caseValue: caseValue as number | null,
      distributedAt: values.distributedAt || null,
    },
  }
}
