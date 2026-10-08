// Tipos do domínio da LexIA.
// Hoje alimentam os dados fictícios; na Fase 4 vão espelhar as tabelas do Supabase.
// Repare que tudo pertence a um escritório (officeId): é a base do multi-tenant.

// As listas ficam em constantes para serem usadas em dois lugares:
// os tipos abaixo e as opções dos filtros da tela de Processos.
export const PROCESS_STATUSES = ['Em andamento', 'Em análise', 'Pendente', 'Concluído'] as const
export type ProcessStatus = (typeof PROCESS_STATUSES)[number]

export const PROCESS_TYPES = ['Cível', 'Trabalhista', 'Empresarial', 'Tributário'] as const
export type ProcessType = (typeof PROCESS_TYPES)[number]

export interface Office {
  id: string
  name: string
}

export interface CurrentUser {
  id: string
  officeId: string
  name: string
  initials: string
  role: string
}

export interface Process {
  id: string
  officeId: string
  number: string
  client: string
  type: ProcessType
  responsible: string
  status: ProcessStatus
  updatedAt: string
}

export type DeadlineTone = 'pending' | 'progress' | 'review'

export interface Deadline {
  id: string
  month: string
  day: string
  title: string
  processNumber: string
  when: string
  tone: DeadlineTone
}
