import type { Permission } from './types'

// O que cada função pode fazer. Espelha as políticas (RLS) do banco em supabase/01_schema.sql:
// quem de fato barra o acesso é o banco; esta tabela só EXPLICA as regras na tela de Equipe.
export const permissions: Permission[] = [
  { label: 'Ver processos e documentos', roles: ['Administrador', 'Advogado', 'Estagiário'] },
  { label: 'Enviar documentos', roles: ['Administrador', 'Advogado', 'Estagiário'] },
  { label: 'Consultar processos', roles: ['Administrador', 'Advogado', 'Estagiário'] },
  { label: 'Editar análises', roles: ['Administrador', 'Advogado'] },
  { label: 'Gerenciar equipe', roles: ['Administrador'] },
  { label: 'Alterar configurações do escritório', roles: ['Administrador'] },
]
