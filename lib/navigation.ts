import {
  BarChart3,
  BriefcaseBusiness,
  FolderOpen,
  LayoutDashboard,
  Settings,
  Users,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

// Cada href corresponde a uma pasta dentro de app/(app)/.
export const navItems: NavItem[] = [
  { label: 'Visão geral', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Processos', href: '/processos', icon: BriefcaseBusiness },
  { label: 'Documentos', href: '/documentos', icon: FolderOpen },
  { label: 'Análises', href: '/analises', icon: BarChart3 },
  { label: 'Equipe', href: '/equipe', icon: Users },
  { label: 'Configurações', href: '/configuracoes', icon: Settings },
]

// "/processos/123" também conta como ativo para o item "/processos".
export function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function getCurrentNavItem(pathname: string) {
  return navItems.find((item) => isActivePath(pathname, item.href))
}
