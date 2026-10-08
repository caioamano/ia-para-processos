// DADOS FICTÍCIOS da tela de Processo individual (documentos, análise, consulta, histórico).
// Tudo é calculado a partir do próprio processo, sem números aleatórios, então o resultado
// é sempre o mesmo. Na Fase 4 em diante, estas funções são trocadas por consultas ao Supabase.

import { formatCurrency, formatDate } from './format'
import { office, processes } from './mock-data'
import type {
  AnalysisSection,
  ConversationTurn,
  Process,
  ProcessDetails,
  ProcessDocument,
  TimelineEvent,
} from './types'

// REGRA DE MULTI-TENANT: só devolve o processo se ele pertencer ao escritório de quem está logado.
// Hoje isso é feito aqui, no código. Na Fase 6 quem garante isso é o banco (RLS).
export function getProcessById(id: string): Process | undefined {
  return processes.find((process) => process.id === id && process.officeId === office.id)
}

function seedOf(process: Process) {
  return Number(process.id.replace('proc-', ''))
}

const DAY = 24 * 60 * 60 * 1000

function baseDateOf(seed: number) {
  return new Date(Date.UTC(2026, 8, 13 - (seed % 20)))
}

function daysBefore(base: Date, days: number) {
  return new Date(base.getTime() - days * DAY)
}

const courtByType: Record<Process['type'], string> = {
  Cível: 'Vara Cível',
  Trabalhista: 'Vara do Trabalho',
  Empresarial: 'Vara Empresarial',
  Tributário: 'Vara da Fazenda Pública',
}

const counterparties = [
  'Banco Meridional S.A.',
  'Seguradora Atlântica',
  'Imobiliária Prime Ltda.',
  'Telecom Brasil S.A.',
  'Construtora Pilar Ltda.',
  'Comercial Vitória Ltda.',
]

export function getProcessDetails(process: Process): ProcessDetails {
  const seed = seedOf(process)
  return {
    court: `${(seed % 6) + 1}ª ${courtByType[process.type]}`,
    caseValue: formatCurrency(25000 + ((seed * 7919) % 400000)),
    distributedAt: formatDate(daysBefore(baseDateOf(seed), 70)),
    counterparty: counterparties[seed % counterparties.length],
  }
}

export function getDocuments(process: Process): ProcessDocument[] {
  const seed = seedOf(process)
  const base = baseDateOf(seed)

  const templates: Array<Pick<ProcessDocument, 'name' | 'fileName' | 'status'> & { pages: number; daysAgo: number }> = [
    { name: 'Petição Inicial', fileName: 'peticao-inicial.pdf', pages: 14 + (seed % 9), daysAgo: 70, status: 'Analisado' },
    { name: 'Procuração', fileName: 'procuracao.pdf', pages: 2, daysAgo: 70, status: 'Analisado' },
    { name: 'Contestação', fileName: 'contestacao.pdf', pages: 18 + (seed % 7), daysAgo: 9, status: 'Analisado' },
    { name: 'Despacho', fileName: 'despacho.pdf', pages: 2, daysAgo: 0, status: 'Analisado' },
    { name: 'Decisão interlocutória', fileName: 'decisao-interlocutoria.pdf', pages: 5 + (seed % 3), daysAgo: 41, status: 'Em processamento' },
    { name: 'Documentos anexos', fileName: 'documentos-anexos.pdf', pages: 38 + (seed % 20), daysAgo: 70, status: 'Pendente' },
  ]

  return templates.map((template, index) => ({
    id: `doc-${seed}-${index + 1}`,
    officeId: process.officeId,
    processId: process.id,
    name: template.name,
    fileName: template.fileName,
    pages: template.pages,
    size: `${(template.pages * 0.12).toFixed(1).replace('.', ',')} MB`,
    uploadedAt: formatDate(daysBefore(base, template.daysAgo)),
    status: template.status,
  }))
}

// Mais recente primeiro.
export function getTimeline(process: Process): TimelineEvent[] {
  const seed = seedOf(process)
  const base = baseDateOf(seed)
  const details = getProcessDetails(process)

  const events: Array<{ title: string; description: string; daysAgo: number }> = [
    { title: 'Despacho', description: 'Intimação da parte autora para manifestação no prazo de 15 dias.', daysAgo: 0 },
    { title: 'Juntada de contestação', description: `Contestação apresentada por ${details.counterparty}.`, daysAgo: 9 },
    { title: 'Citação', description: 'Parte ré citada para apresentar defesa.', daysAgo: 24 },
    { title: 'Despacho inicial', description: 'Petição inicial recebida e citação determinada.', daysAgo: 41 },
    { title: 'Distribuição', description: `Processo distribuído à ${details.court}.`, daysAgo: 70 },
  ]

  return events.map((event, index) => ({
    id: `event-${seed}-${index + 1}`,
    date: formatDate(daysBefore(base, event.daysAgo)),
    title: event.title,
    description: event.description,
  }))
}

// Os números de página abaixo cabem dentro das páginas de cada documento (ver getDocuments).
export function getAnalysis(process: Process): AnalysisSection[] {
  const details = getProcessDetails(process)

  return [
    {
      id: 'partes',
      title: 'Partes',
      items: [
        { label: 'Autor', value: process.client, source: { document: 'Petição Inicial', page: 1 } },
        { label: 'Réu', value: details.counterparty, source: { document: 'Petição Inicial', page: 1 } },
      ],
    },
    {
      id: 'valores',
      title: 'Valores',
      items: [
        { label: 'Valor da causa', value: details.caseValue, source: { document: 'Petição Inicial', page: 4 } },
      ],
    },
    {
      id: 'pedidos',
      title: 'Pedidos',
      items: [
        {
          label: 'Pedido principal',
          value: 'Condenação da parte ré ao pagamento da indenização pleiteada.',
          source: { document: 'Petição Inicial', page: 12 },
        },
        {
          label: 'Pedidos acessórios',
          value: 'Custas processuais e honorários de sucumbência.',
          source: { document: 'Petição Inicial', page: 13 },
        },
      ],
    },
    {
      id: 'argumentos',
      title: 'Argumentos',
      items: [
        {
          label: 'Parte autora',
          value: 'Narra os fatos que deram origem à ação e fundamenta o pedido.',
          source: { document: 'Petição Inicial', page: 7 },
        },
        {
          label: 'Parte ré',
          value: 'Contesta os fatos narrados e impugna o valor pretendido.',
          source: { document: 'Contestação', page: 9 },
        },
      ],
    },
    {
      id: 'decisoes',
      title: 'Decisões',
      items: [
        {
          label: 'Último despacho',
          value: 'Determinou a intimação da parte autora para manifestação.',
          source: { document: 'Despacho', page: 1 },
        },
      ],
    },
    {
      id: 'prazos',
      title: 'Prazos',
      items: [
        {
          label: 'Manifestação da parte autora',
          value: '15 dias, conforme o último despacho.',
          source: { document: 'Despacho', page: 1 },
        },
      ],
    },
  ]
}

export function getConversation(process: Process): ConversationTurn[] {
  const details = getProcessDetails(process)

  return [
    {
      question: 'Qual é o valor da causa?',
      answer: `O valor da causa informado na petição inicial é de ${details.caseValue}.`,
      source: { document: 'Petição Inicial', page: 4 },
    },
    {
      question: 'Qual foi o último despacho?',
      answer:
        'O último despacho determinou a intimação da parte autora para manifestação no prazo de 15 dias.',
      source: { document: 'Despacho', page: 1 },
    },
  ]
}
