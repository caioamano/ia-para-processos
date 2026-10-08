import { SidebarContent } from '@/components/layout/sidebar-content'

// Menu fixo, só em telas grandes (a partir de 1024px). No celular e no tablet em pé
// quem aparece é o botão de menu da barra superior (mobile-nav.tsx).
export function Sidebar() {
  return (
    <aside className="hidden w-[248px] shrink-0 flex-col border-r border-border bg-muted px-4 py-5 lg:flex">
      <SidebarContent />
    </aside>
  )
}
