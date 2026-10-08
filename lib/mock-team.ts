// DADOS FICTÍCIOS da equipe. Na Fase 5/6 vêm do Supabase (tabela users, com office_id).

import { currentUser, office } from './mock-data'
import type { Permission, TeamMember } from './types'

export const teamMembers: TeamMember[] = [
  {
    id: currentUser.id,
    officeId: office.id,
    name: 'Caio Henrique',
    email: 'caio@silvaassociados.example',
    role: 'Administrador',
    status: 'Ativo',
    lastAccess: 'Hoje, 09:42',
  },
  {
    id: 'user-ana',
    officeId: office.id,
    name: 'Ana Beatriz',
    email: 'ana.beatriz@silvaassociados.example',
    role: 'Advogado',
    status: 'Ativo',
    lastAccess: 'Ontem, 16:18',
  },
  {
    id: 'user-lucas',
    officeId: office.id,
    name: 'Lucas Mendes',
    email: 'lucas.mendes@silvaassociados.example',
    role: 'Advogado',
    status: 'Ativo',
    lastAccess: '12 set. 2026',
  },
  {
    id: 'user-marina',
    officeId: office.id,
    name: 'Marina Rocha',
    email: 'marina.rocha@silvaassociados.example',
    role: 'Estagiário',
    status: 'Ativo',
    lastAccess: '11 set. 2026',
  },
  {
    id: 'user-paulo',
    officeId: office.id,
    name: 'Paulo Siqueira',
    email: 'paulo.siqueira@silvaassociados.example',
    role: 'Estagiário',
    status: 'Convite pendente',
    lastAccess: '—',
  },
]

// Regras ilustrativas. As reais serão definidas junto com a autenticação.
export const permissions: Permission[] = [
  { label: 'Ver processos e documentos', roles: ['Administrador', 'Advogado', 'Estagiário'] },
  { label: 'Enviar documentos', roles: ['Administrador', 'Advogado', 'Estagiário'] },
  { label: 'Consultar processos', roles: ['Administrador', 'Advogado', 'Estagiário'] },
  { label: 'Editar análises', roles: ['Administrador', 'Advogado'] },
  { label: 'Gerenciar equipe', roles: ['Administrador'] },
  { label: 'Alterar configurações do escritório', roles: ['Administrador'] },
]
