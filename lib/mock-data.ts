// DADOS FICTÍCIOS: servem só para desenhar a interface.
// Na Fase 4 (Supabase) este arquivo deixa de ser usado, e as telas passam a
// buscar os mesmos dados no banco. Nunca coloque processos reais aqui.

import { PROCESS_STATUSES, PROCESS_TYPES } from './types'
import type { CurrentUser, Deadline, Office, Process } from './types'

export const office: Office = {
  id: 'office-silva',
  name: 'Silva & Associados',
}

export const currentUser: CurrentUser = {
  id: 'user-caio',
  officeId: office.id,
  name: 'Caio Henrique',
  initials: 'CH',
  role: 'Administrador',
}

const featuredProcesses: Process[] = [
  {
    id: 'proc-1',
    officeId: office.id,
    number: '0001234-56.2026.8.16.0001',
    client: 'Almeida Comércio Ltda.',
    type: 'Cível',
    responsible: 'Caio Henrique',
    status: 'Em andamento',
    updatedAt: 'Hoje, 09:42',
  },
  {
    id: 'proc-2',
    officeId: office.id,
    number: '0009876-12.2025.8.26.0100',
    client: 'Mariana Costa',
    type: 'Trabalhista',
    responsible: 'Ana Beatriz',
    status: 'Em análise',
    updatedAt: 'Ontem, 16:18',
  },
  {
    id: 'proc-3',
    officeId: office.id,
    number: '0014567-89.2024.8.16.0030',
    client: 'Grupo Horizonte S.A.',
    type: 'Empresarial',
    responsible: 'Caio Henrique',
    status: 'Pendente',
    updatedAt: '18 set. 2026',
  },
  {
    id: 'proc-4',
    officeId: office.id,
    number: '0007821-44.2026.8.19.0001',
    client: 'Rafael Nogueira',
    type: 'Cível',
    responsible: 'Lucas Mendes',
    status: 'Concluído',
    updatedAt: '16 set. 2026',
  },
  {
    id: 'proc-5',
    officeId: office.id,
    number: '0023412-20.2025.8.16.0001',
    client: 'Construtora Vale Azul',
    type: 'Tributário',
    responsible: 'Ana Beatriz',
    status: 'Em andamento',
    updatedAt: '14 set. 2026',
  },
]


// Gera processos fictícios para a lista ter volume suficiente (paginação, filtros).
// Não usa números aleatórios: o resultado é sempre o mesmo, o que evita diferenças
// entre o que o servidor e o navegador desenham.
const clientNames = [
  'Padaria Santa Clara Ltda.',
  'Marcos Vinícius Prado',
  'Transportes Rota Sul S.A.',
  'Helena Duarte Carvalho',
  'Clínica Vida Plena',
  'Oficina Mecânica Ferraz',
  'Beatriz Lima Montenegro',
  'Distribuidora Alvorada Ltda.',
  'João Pedro Sampaio',
  'Escola Novo Horizonte',
  'Fernanda Albuquerque',
  'Indústria Metalúrgica Brasil',
  'Condomínio Residencial Aurora',
  'Ricardo Teixeira Neto',
  'Farmácia Bom Remédio Ltda.',
  'Luciana Ferreira Souza',
]

const responsibles = ['Caio Henrique', 'Ana Beatriz', 'Lucas Mendes']

const monthLabels = ['jan.', 'fev.', 'mar.', 'abr.', 'mai.', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.']

function formatDate(date: Date) {
  return `${date.getUTCDate()} ${monthLabels[date.getUTCMonth()]} ${date.getUTCFullYear()}`
}

function generateProcesses(count: number, firstNumber: number): Process[] {
  return Array.from({ length: count }, (_, index) => {
    const n = firstNumber + index
    const type = PROCESS_TYPES[(n * 7) % PROCESS_TYPES.length]
    const sequence = String(1000000 + ((n * 48271) % 8999999))
    const digits = String(10 + ((n * 17) % 90))
    const year = 2022 + (n % 5)
    const court = type === 'Trabalhista' ? '5.09.0010' : n % 2 === 0 ? '8.16.0001' : '8.26.0100'
    const date = new Date(Date.UTC(2026, 8, 13 - Math.floor(index * 0.9)))

    return {
      id: `proc-${n}`,
      officeId: office.id,
      number: `${sequence}-${digits}.${year}.${court}`,
      client: clientNames[(n * 3) % clientNames.length],
      type,
      responsible: responsibles[n % responsibles.length],
      status: PROCESS_STATUSES[(n * 5) % PROCESS_STATUSES.length],
      updatedAt: formatDate(date),
    }
  })
}

// 5 processos "de destaque" (os do dashboard) + 123 gerados = 128 no total.
export const processes: Process[] = [
  ...featuredProcesses,
  ...generateProcesses(123, featuredProcesses.length + 1),
]

export const deadlines: Deadline[] = [
  {
    id: 'deadline-1',
    month: 'OUT',
    day: '08',
    title: 'Manifestação processual',
    processNumber: '0001234-56.2026',
    when: 'Amanhã',
    tone: 'pending',
  },
  {
    id: 'deadline-2',
    month: 'OUT',
    day: '12',
    title: 'Audiência de conciliação',
    processNumber: '0009876-12.2025',
    when: 'Em 5 dias',
    tone: 'progress',
  },
  {
    id: 'deadline-3',
    month: 'OUT',
    day: '18',
    title: 'Prazo para recurso',
    processNumber: '0014567-89.2024',
    when: 'Em 11 dias',
    tone: 'review',
  },
]

// Altura (em %) de cada barra do gráfico de atividade.
export const activityBars = [42, 58, 35, 72, 54, 88, 64, 76, 48, 68, 82, 59, 92, 70]
