import { cache } from 'react'

import {
  formatBytes,
  formatCurrency,
  formatDateOnly,
  formatTimestamp,
  formatTimestampDate,
} from '@/lib/format'
import { createClient } from '@/lib/supabase/server'
import type {
  AnalysisOverview,
  AnalysisSection,
  AnalysisStatus,
  ConversationTurn,
  DocumentStatus,
  OfficeDocument,
  Process,
  ProcessDetails,
  ProcessDocument,
  ProcessStatus,
  ProcessType,
  TimelineEvent,
} from '@/lib/types'

// =====================================================================
// Consultas ao Supabase (rodam no servidor).
// Repare que NENHUMA consulta filtra por escritório: quem faz isso é o RLS do banco.
// O banco já devolve só as linhas do escritório de quem está logado.
// =====================================================================

// "Responsável" vem de uma ligação com a tabela profiles. O Supabase devolve
// essa ligação como um objeto (ou, em alguns casos, como lista de 1 item).
type NameRelation = { name: string } | { name: string }[] | null

function nameOf(relation: NameRelation): string {
  if (!relation) return 'Sem responsável'
  const profile = Array.isArray(relation) ? relation[0] : relation
  return profile?.name ?? 'Sem responsável'
}

function firstOf<T>(relation: T | T[] | null): T | null {
  if (!relation) return null
  return Array.isArray(relation) ? (relation[0] ?? null) : relation
}

function fail(what: string, error: { message: string }): never {
  // O texto aparece nos logs da Vercel, não para o usuário.
  throw new Error(`Falha ao carregar ${what}: ${error.message}`)
}

// ---------- Processos ----------

interface ProcessRow {
  id: string
  office_id: string
  number: string
  client: string
  type: ProcessType
  status: ProcessStatus
  updated_at: string
  profiles: NameRelation
}

const PROCESS_COLUMNS = 'id, office_id, number, client, type, status, updated_at, profiles(name)'

function toProcess(row: ProcessRow): Process {
  return {
    id: row.id,
    officeId: row.office_id,
    number: row.number,
    client: row.client,
    type: row.type,
    responsible: nameOf(row.profiles),
    status: row.status,
    updatedAt: formatTimestamp(row.updated_at),
  }
}

// Todos os processos do escritório, do mais recente para o mais antigo.
export async function getProcesses(): Promise<Process[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('processes')
    .select(PROCESS_COLUMNS)
    .order('updated_at', { ascending: false })
  if (error) fail('os processos', error)
  return (data as ProcessRow[]).map(toProcess)
}

// Os mais recentes + o total (usado no dashboard).
export async function getRecentProcesses(limit: number): Promise<{ processes: Process[]; total: number }> {
  const supabase = await createClient()
  const { data, error, count } = await supabase
    .from('processes')
    .select(PROCESS_COLUMNS, { count: 'exact' })
    .order('updated_at', { ascending: false })
    .limit(limit)
  if (error) fail('os processos recentes', error)
  return { processes: (data as ProcessRow[]).map(toProcess), total: count ?? 0 }
}

// ---------- Um processo (tela de Processo individual) ----------

interface ProcessDetailRow extends ProcessRow {
  court: string | null
  case_value: number | string | null
  counterparty: string | null
  distributed_at: string | null
}

interface DocumentRow {
  id: string
  office_id: string
  process_id: string
  name: string
  file_name: string
  pages: number
  size_bytes: number
  status: DocumentStatus
  uploaded_at: string
}

interface EventRow {
  id: string
  event_date: string
  title: string
  description: string
}

interface AnalysisItemRow {
  section: string
  position: number
  label: string
  value: string
  source_document_id: string | null
  source_page: number | null
}

interface ConsultationRow {
  question: string
  answer: string
  source_document_id: string | null
  source_page: number | null
}

export interface ProcessPageData {
  process: Process
  details: ProcessDetails
  documents: ProcessDocument[]
  timeline: TimelineEvent[]
  analysis: AnalysisSection[]
  conversation: ConversationTurn[]
}

const ANALYSIS_SECTIONS = ['Partes', 'Valores', 'Pedidos', 'Argumentos', 'Decisões', 'Prazos']

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function toDocument(row: DocumentRow): ProcessDocument {
  return {
    id: row.id,
    officeId: row.office_id,
    processId: row.process_id,
    name: row.name,
    fileName: row.file_name,
    pages: row.pages,
    size: formatBytes(Number(row.size_bytes)),
    uploadedAt: formatTimestampDate(row.uploaded_at),
    status: row.status,
  }
}

// "cache" faz a página e o título (generateMetadata) compartilharem a mesma busca.
// Devolve null se o processo não existe OU é de outro escritório (o RLS esconde).
export const getProcessPage = cache(async (id: string): Promise<ProcessPageData | null> => {
  // Um id que não é UUID (ex.: link antigo "proc-1") nunca existe; evita erro do banco.
  if (!UUID.test(id)) return null

  const supabase = await createClient()

  const [processRes, documentsRes, eventsRes, analysisRes, consultationsRes] = await Promise.all([
    supabase
      .from('processes')
      .select(`${PROCESS_COLUMNS}, court, case_value, counterparty, distributed_at`)
      .eq('id', id)
      .maybeSingle(),
    supabase
      .from('documents')
      .select('id, office_id, process_id, name, file_name, pages, size_bytes, status, uploaded_at')
      .eq('process_id', id)
      .order('uploaded_at', { ascending: true })
      .order('name', { ascending: true }),
    supabase
      .from('process_events')
      .select('id, event_date, title, description')
      .eq('process_id', id)
      .order('event_date', { ascending: false }),
    supabase
      .from('analyses')
      .select('id, analysis_items(section, position, label, value, source_document_id, source_page)')
      .eq('process_id', id)
      .maybeSingle(),
    supabase
      .from('consultations')
      .select('question, answer, source_document_id, source_page')
      .eq('process_id', id)
      .order('created_at', { ascending: true }),
  ])

  if (processRes.error) fail('o processo', processRes.error)
  if (!processRes.data) return null
  if (documentsRes.error) fail('os documentos', documentsRes.error)
  if (eventsRes.error) fail('o histórico', eventsRes.error)
  if (analysisRes.error) fail('a análise', analysisRes.error)
  if (consultationsRes.error) fail('as consultas', consultationsRes.error)

  const row = processRes.data as unknown as ProcessDetailRow
  const documentRows = documentsRes.data as DocumentRow[]
  const documentNames = new Map(documentRows.map((document) => [document.id, document.name]))

  // Monta "Fonte: documento — página" quando o banco tem as duas informações.
  function sourceOf(documentId: string | null, page: number | null) {
    const document = documentId ? documentNames.get(documentId) : undefined
    return document && page ? { document, page } : null
  }

  const details: ProcessDetails = {
    court: row.court ?? '—',
    caseValue: row.case_value != null ? formatCurrency(Number(row.case_value)) : '—',
    distributedAt: row.distributed_at ? formatDateOnly(row.distributed_at) : '—',
    counterparty: row.counterparty ?? '—',
  }

  const items = ((analysisRes.data?.analysis_items ?? []) as AnalysisItemRow[])
    .slice()
    .sort((a, b) => a.position - b.position)

  const analysis: AnalysisSection[] = ANALYSIS_SECTIONS.map((title) => ({
    id: title.toLowerCase(),
    title,
    items: items
      .filter((item) => item.section === title)
      .map((item) => ({
        label: item.label,
        value: item.value,
        source: sourceOf(item.source_document_id, item.source_page),
      })),
  })).filter((section) => section.items.length > 0)

  return {
    process: toProcess(row),
    details,
    documents: documentRows.map(toDocument),
    timeline: (eventsRes.data as EventRow[]).map((event) => ({
      id: event.id,
      date: formatDateOnly(event.event_date),
      title: event.title,
      description: event.description,
    })),
    analysis,
    conversation: (consultationsRes.data as ConsultationRow[]).map((consultation) => ({
      question: consultation.question,
      answer: consultation.answer,
      source: sourceOf(consultation.source_document_id, consultation.source_page),
    })),
  }
})

// ---------- Documentos do escritório (tela "Documentos") ----------

type ProcessRef = { number: string; client: string }

export async function getOfficeDocuments(): Promise<OfficeDocument[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('documents')
    .select('id, office_id, process_id, name, file_name, pages, size_bytes, status, uploaded_at, processes(number, client)')
    .order('uploaded_at', { ascending: false })
    .order('name', { ascending: true })
  if (error) fail('os documentos', error)

  return (data as unknown as Array<DocumentRow & { processes: ProcessRef | ProcessRef[] | null }>).map((row) => {
    const process = firstOf(row.processes)
    return {
      ...toDocument(row),
      processNumber: process?.number ?? '—',
      client: process?.client ?? '—',
    }
  })
}

// ---------- Situação da análise de cada processo (tela "Análises") ----------

export async function getAnalysisOverview(): Promise<AnalysisOverview[]> {
  const supabase = await createClient()

  const [analysesRes, documentsRes] = await Promise.all([
    supabase
      .from('analyses')
      .select('process_id, status, updated_at, processes(number, client, type)')
      .order('updated_at', { ascending: false }),
    supabase.from('documents').select('process_id, status'),
  ])
  if (analysesRes.error) fail('as análises', analysesRes.error)
  if (documentsRes.error) fail('os documentos', documentsRes.error)

  // Conta, por processo, quantos documentos existem e quantos já foram analisados.
  const counts = new Map<string, { total: number; analyzed: number }>()
  for (const document of documentsRes.data as Array<{ process_id: string; status: DocumentStatus }>) {
    const current = counts.get(document.process_id) ?? { total: 0, analyzed: 0 }
    current.total += 1
    if (document.status === 'Analisado') current.analyzed += 1
    counts.set(document.process_id, current)
  }

  type Row = {
    process_id: string
    status: AnalysisStatus
    updated_at: string
    processes: (ProcessRef & { type: ProcessType }) | Array<ProcessRef & { type: ProcessType }> | null
  }

  return (analysesRes.data as unknown as Row[]).flatMap((row) => {
    const process = firstOf(row.processes)
    if (!process) return []
    const count = counts.get(row.process_id) ?? { total: 0, analyzed: 0 }
    return [
      {
        processId: row.process_id,
        number: process.number,
        client: process.client,
        type: process.type,
        analyzedDocuments: count.analyzed,
        totalDocuments: count.total,
        status: row.status,
        updatedAt: formatTimestamp(row.updated_at),
      },
    ]
  })
}
