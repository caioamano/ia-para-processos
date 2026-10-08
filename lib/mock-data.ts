// DADOS FICTÍCIOS: servem só para desenhar a interface.
// Na Fase 4 (Supabase) este arquivo deixa de ser usado, e as telas passam a
// buscar os mesmos dados no banco. Nunca coloque processos reais aqui.

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

export const processes: Process[] = [
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
