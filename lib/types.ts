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

// ---------- Tela de Processo individual ----------

// De onde saiu uma informação: documento + página. É o coração da confiança no produto:
// o advogado sempre consegue conferir a origem.
export interface SourceReference {
  document: string
  page: number
}

export interface ProcessDetails {
  court: string
  caseValue: string
  distributedAt: string
  counterparty: string
}

export const DOCUMENT_STATUSES = ['Analisado', 'Em processamento', 'Pendente'] as const
export type DocumentStatus = (typeof DOCUMENT_STATUSES)[number]

export interface ProcessDocument {
  id: string
  officeId: string
  processId: string
  name: string
  fileName: string
  pages: number
  size: string
  uploadedAt: string
  status: DocumentStatus
  // Verdadeiro quando há um PDF guardado no Storage (os documentos fictícios do início não têm).
  hasFile: boolean
}

export interface TimelineEvent {
  id: string
  date: string
  title: string
  description: string
}

export interface AnalysisItem {
  label: string
  value: string
  // Pode ser vazio: o banco permite uma informação sem fonte (ex.: se o documento foi apagado).
  source: SourceReference | null
}

export interface AnalysisSection {
  id: string
  title: string
  items: AnalysisItem[]
}

export interface ConversationTurn {
  question: string
  answer: string
  source: SourceReference | null
}

// ---------- Telas de Documentos, Análises, Equipe ----------

// Um documento visto de fora do processo: precisa saber a qual processo e cliente pertence.
export interface OfficeDocument extends ProcessDocument {
  processNumber: string
  client: string
}

export const ANALYSIS_STATUSES = ['Concluída', 'Em processamento', 'Pendente'] as const
export type AnalysisStatus = (typeof ANALYSIS_STATUSES)[number]

export interface AnalysisOverview {
  processId: string
  number: string
  client: string
  type: ProcessType
  analyzedDocuments: number
  totalDocuments: number
  status: AnalysisStatus
  updatedAt: string
}

export const ROLES = ['Administrador', 'Advogado', 'Estagiário'] as const
export type Role = (typeof ROLES)[number]

export type MemberStatus = 'Ativo' | 'Convite pendente'

export interface TeamMember {
  id: string
  officeId: string
  name: string
  email: string
  role: Role
  status: MemberStatus
  lastAccess: string
}

export interface Permission {
  label: string
  roles: Role[]
}
