'use client'

import { useState } from 'react'
import {
  BarChart3,
  Bell,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  FileText,
  FolderOpen,
  LayoutDashboard,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  SlidersHorizontal,
  Users,
} from 'lucide-react'

const processos = [
  { numero: '0001234-56.2026.8.16.0001', cliente: 'Almeida Comércio Ltda.', tipo: 'Cível', responsavel: 'Caio Henrique', status: 'Em andamento', data: 'Hoje, 09:42' },
  { numero: '0009876-12.2025.8.26.0100', cliente: 'Mariana Costa', tipo: 'Trabalhista', responsavel: 'Ana Beatriz', status: 'Em análise', data: 'Ontem, 16:18' },
  { numero: '0014567-89.2024.8.16.0030', cliente: 'Grupo Horizonte S.A.', tipo: 'Empresarial', responsavel: 'Caio Henrique', status: 'Pendente', data: '18 set. 2026' },
  { numero: '0007821-44.2026.8.19.0001', cliente: 'Rafael Nogueira', tipo: 'Cível', responsavel: 'Lucas Mendes', status: 'Concluído', data: '16 set. 2026' },
  { numero: '0023412-20.2025.8.16.0001', cliente: 'Construtora Vale Azul', tipo: 'Tributário', responsavel: 'Ana Beatriz', status: 'Em andamento', data: '14 set. 2026' },
]

const navItems = [
  { label: 'Visão geral', icon: LayoutDashboard },
  { label: 'Processos', icon: BriefcaseBusiness },
  { label: 'Documentos', icon: FolderOpen },
  { label: 'Análises', icon: BarChart3 },
  { label: 'Equipe', icon: Users },
  { label: 'Configurações', icon: Settings },
]

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    'Em andamento': 'bg-status-progress-bg text-status-progress',
    'Em análise': 'bg-status-review-bg text-status-review',
    Pendente: 'bg-status-pending-bg text-status-pending',
    Concluído: 'bg-status-done-bg text-status-done',
  }
  return <span className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ${styles[status]}`}>{status}</span>
}

function Sidebar({ active, onNavigate }: { active: string; onNavigate: (label: string) => void }) {
  return (
    <aside className="hidden w-[248px] shrink-0 flex-col border-r border-border bg-muted px-4 py-5 lg:flex">
      <div className="flex items-center gap-3 px-3">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-sm font-semibold tracking-tight text-white">L</div>
        <span className="text-[18px] font-semibold tracking-[-0.03em] text-primary">LexIA</span>
      </div>
      <div className="mt-9 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-subtle">Workspace</div>
      <nav className="mt-3 flex flex-col gap-1" aria-label="Navegação principal">
        {navItems.map(({ label, icon: Icon }) => {
          const selected = active === label
          return (
            <button key={label} onClick={() => onNavigate(label)} className={`relative flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-[13px] transition-colors duration-150 ${selected ? 'bg-secondary font-medium text-primary' : 'text-muted-foreground hover:bg-accent hover:text-primary'}`}>
              {selected && <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-primary" />}
              <Icon className="size-[16px]" strokeWidth={1.8} />
              {label}
            </button>
          )
        })}
      </nav>
      <div className="mt-auto border-t border-border pt-4">
        <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left hover:bg-accent">
          <div className="flex size-8 items-center justify-center rounded-full bg-olive text-[11px] font-semibold text-white">CH</div>
          <span className="min-w-0 flex-1"><span className="block truncate text-[12px] font-medium text-foreground">Caio Henrique</span><span className="block text-[11px] text-subtle">Administrador</span></span>
          <ChevronDown className="size-3.5 text-subtle" />
        </button>
        <p className="mt-3 px-3 text-[11px] text-subtle">Silva & Associados</p>
      </div>
    </aside>
  )
}

function Stat({ value, label, note, icon: Icon }: { value: string; label: string; note: string; icon: typeof BriefcaseBusiness }) {
  return <div className="rounded-lg border border-border bg-white p-5"><div className="flex items-start justify-between"><div><p className="text-[27px] font-semibold tracking-[-0.04em] text-primary">{value}</p><p className="mt-1 text-[13px] text-muted-foreground">{label}</p></div><Icon className="size-[18px] text-olive" strokeWidth={1.7} /></div><p className="mt-5 text-[11px] text-subtle">{note}</p></div>
}

export default function Page() {
  const [active, setActive] = useState('Visão geral')
  const [query, setQuery] = useState('')
  const filtered = processos.filter((processo) => Object.values(processo).some((value) => value.toLowerCase().includes(query.toLowerCase())))

  return <div className="flex min-h-screen bg-background text-foreground">
    <Sidebar active={active} onNavigate={setActive} />
    <div className="min-w-0 flex-1">
      <header className="flex h-[70px] items-center justify-between border-b border-border bg-white px-6 lg:px-10">
        <div className="flex items-center gap-3"><span className="text-sm font-medium text-muted-foreground">Silva & Associados</span><span className="text-subtle">/</span><span className="text-sm text-subtle">{active}</span></div>
        <div className="flex items-center gap-4"><button aria-label="Notificações" className="relative text-muted-foreground hover:text-primary"><Bell className="size-[18px]" strokeWidth={1.8} /><span className="absolute -right-0.5 -top-0.5 size-1.5 rounded-full bg-olive" /></button><div className="hidden h-5 w-px bg-border sm:block" /><span className="text-xs text-muted-foreground">07 de outubro de 2026</span></div>
      </header>
      <main className="mx-auto max-w-[1440px] px-6 py-8 lg:px-10 lg:py-10">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-olive">Painel do escritório</p><h1 className="text-[28px] font-semibold tracking-[-0.04em] text-primary">Visão geral</h1><p className="mt-2 text-sm text-muted-foreground">Acompanhe os processos e atividades do escritório.</p></div><button className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-3.5 text-xs font-medium text-white transition-colors hover:bg-primary-hover"><Plus className="size-4" /> Novo processo</button></div>
        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Indicadores do escritório"><Stat value="128" label="Processos ativos" note="+8 desde o último mês" icon={BriefcaseBusiness} /><Stat value="84" label="Processos analisados" note="66% dos processos ativos" icon={ClipboardList} /><Stat value="1.284" label="Documentos" note="32 adicionados este mês" icon={FileText} /><Stat value="7" label="Pendências" note="3 com prazo nesta semana" icon={CheckCircle2} /></section>
        <section className="mt-8 rounded-lg border border-border bg-white"><div className="flex flex-col gap-4 border-b border-line px-5 py-5 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-[15px] font-semibold text-foreground">Processos recentes</h2><p className="mt-1 text-xs text-subtle">Acompanhe as últimas movimentações do escritório.</p></div><div className="flex items-center gap-2"><div className="relative"><Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-subtle" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar processo" className="h-8 w-full rounded-md border border-input bg-muted pl-9 pr-3 text-xs outline-none placeholder:text-subtle focus:border-olive sm:w-[190px]" /></div><button aria-label="Filtrar processos" className="flex size-8 items-center justify-center rounded-md border border-input text-muted-foreground hover:bg-accent"><SlidersHorizontal className="size-3.5" /></button></div></div><div className="overflow-x-auto"><table className="w-full min-w-[800px] text-left"><thead className="bg-muted"><tr className="border-b border-line text-[10px] font-semibold uppercase tracking-[0.1em] text-subtle"><th className="px-5 py-3 font-medium">Número</th><th className="px-4 py-3 font-medium">Cliente</th><th className="px-4 py-3 font-medium">Tipo</th><th className="px-4 py-3 font-medium">Responsável</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium">Atualização</th><th className="px-3 py-3" /></tr></thead><tbody>{filtered.map((processo) => <tr key={processo.numero} className="border-b border-line text-[13px] last:border-0 hover:bg-muted"><td className="px-5 py-4 font-medium text-link">{processo.numero}</td><td className="px-4 py-4 text-foreground">{processo.cliente}</td><td className="px-4 py-4 text-muted-foreground">{processo.tipo}</td><td className="px-4 py-4 text-muted-foreground">{processo.responsavel}</td><td className="px-4 py-4"><StatusBadge status={processo.status} /></td><td className="px-4 py-4 text-subtle">{processo.data}</td><td className="px-3 py-4"><button aria-label={`Mais opções para ${processo.numero}`} className="text-subtle hover:text-primary"><MoreHorizontal className="size-4" /></button></td></tr>)}</tbody></table></div><div className="flex items-center justify-between border-t border-line px-5 py-3"><span className="text-xs text-subtle">Exibindo {filtered.length} de 128 processos</span><button onClick={() => setActive('Processos')} className="text-xs font-medium text-link hover:underline">Ver todos os processos</button></div></section>
        <section className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_1fr]"><div className="rounded-lg border border-border bg-white p-5"><div className="flex items-center justify-between"><div><h2 className="text-[15px] font-semibold text-foreground">Atividade do escritório</h2><p className="mt-1 text-xs text-subtle">Movimentações dos últimos 7 dias.</p></div><button className="text-subtle hover:text-primary" aria-label="Mais opções"><MoreHorizontal className="size-4" /></button></div><div className="mt-6 flex h-[116px] items-end gap-2 border-b border-border px-2">{[42, 58, 35, 72, 54, 88, 64, 76, 48, 68, 82, 59, 92, 70].map((height, index) => <div key={index} className="group flex flex-1 flex-col items-center justify-end gap-2"><div className="w-full max-w-[18px] rounded-t-sm bg-olive-soft transition-colors group-hover:bg-olive" style={{ height: `${height}%` }} /></div>)}</div><div className="mt-3 flex justify-between px-1 text-[10px] text-subtle"><span>01 out.</span><span>03 out.</span><span>05 out.</span><span>07 out.</span></div></div><div className="rounded-lg border border-border bg-white p-5"><div className="flex items-center justify-between"><div><h2 className="text-[15px] font-semibold text-foreground">Próximos prazos</h2><p className="mt-1 text-xs text-subtle">Atenção necessária.</p></div><button className="text-xs font-medium text-link hover:underline">Ver agenda</button></div><div className="mt-5 flex flex-col gap-4"><div className="flex items-center gap-3"><div className="flex size-9 flex-col items-center justify-center rounded-md bg-status-pending-bg text-status-pending"><span className="text-[10px] font-medium">OUT</span><span className="text-sm font-semibold leading-3">08</span></div><div className="min-w-0 flex-1"><p className="truncate text-xs font-medium text-foreground">Manifestação processual</p><p className="mt-1 text-[11px] text-subtle">0001234-56.2026 · Amanhã</p></div></div><div className="flex items-center gap-3"><div className="flex size-9 flex-col items-center justify-center rounded-md bg-secondary text-status-progress"><span className="text-[10px] font-medium">OUT</span><span className="text-sm font-semibold leading-3">12</span></div><div className="min-w-0 flex-1"><p className="truncate text-xs font-medium text-foreground">Audiência de conciliação</p><p className="mt-1 text-[11px] text-subtle">0009876-12.2025 · Em 5 dias</p></div></div><div className="flex items-center gap-3"><div className="flex size-9 flex-col items-center justify-center rounded-md bg-status-review-bg text-status-review"><span className="text-[10px] font-medium">OUT</span><span className="text-sm font-semibold leading-3">18</span></div><div className="min-w-0 flex-1"><p className="truncate text-xs font-medium text-foreground">Prazo para recurso</p><p className="mt-1 text-[11px] text-subtle">0014567-89.2024 · Em 11 dias</p></div></div></div></div></section>
      </main>
    </div>
  </div>
}
