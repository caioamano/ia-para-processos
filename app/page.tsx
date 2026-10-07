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
    'Em andamento': 'bg-[#edf4ee] text-[#2d6044]',
    'Em análise': 'bg-[#f1f2ed] text-[#667054]',
    Pendente: 'bg-[#f5f0e8] text-[#866b43]',
    Concluído: 'bg-[#eef1f2] text-[#5d686b]',
  }
  return <span className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ${styles[status]}`}>{status}</span>
}

function Sidebar({ active, onNavigate }: { active: string; onNavigate: (label: string) => void }) {
  return (
    <aside className="hidden w-[248px] shrink-0 flex-col border-r border-[#e7e9e6] bg-[#fbfcfb] px-4 py-5 lg:flex">
      <div className="flex items-center gap-3 px-3">
        <div className="flex size-9 items-center justify-center rounded-lg bg-[#003020] text-sm font-semibold tracking-tight text-white">L</div>
        <span className="text-[18px] font-semibold tracking-[-0.03em] text-[#003020]">LexIA</span>
      </div>
      <div className="mt-9 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9a9f98]">Workspace</div>
      <nav className="mt-3 flex flex-col gap-1" aria-label="Navegação principal">
        {navItems.map(({ label, icon: Icon }) => {
          const selected = active === label
          return (
            <button key={label} onClick={() => onNavigate(label)} className={`relative flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-[13px] transition-colors duration-150 ${selected ? 'bg-[#edf3ee] font-medium text-[#003020]' : 'text-[#68716c] hover:bg-[#f1f4f1] hover:text-[#003020]'}`}>
              {selected && <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-[#003020]" />}
              <Icon className="size-[16px]" strokeWidth={1.8} />
              {label}
            </button>
          )
        })}
      </nav>
      <div className="mt-auto border-t border-[#e7e9e6] pt-4">
        <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left hover:bg-[#f1f4f1]">
          <div className="flex size-8 items-center justify-center rounded-full bg-[#829b66] text-[11px] font-semibold text-white">CH</div>
          <span className="min-w-0 flex-1"><span className="block truncate text-[12px] font-medium text-[#29332e]">Caio Henrique</span><span className="block text-[11px] text-[#89918b]">Administrador</span></span>
          <ChevronDown className="size-3.5 text-[#89918b]" />
        </button>
        <p className="mt-3 px-3 text-[11px] text-[#9a9f98]">Silva & Associados</p>
      </div>
    </aside>
  )
}

function Stat({ value, label, note, icon: Icon }: { value: string; label: string; note: string; icon: typeof BriefcaseBusiness }) {
  return <div className="rounded-lg border border-[#e5e9e5] bg-white p-5"><div className="flex items-start justify-between"><div><p className="text-[27px] font-semibold tracking-[-0.04em] text-[#003020]">{value}</p><p className="mt-1 text-[13px] text-[#66716b]">{label}</p></div><Icon className="size-[18px] text-[#829b66]" strokeWidth={1.7} /></div><p className="mt-5 text-[11px] text-[#9aa19c]">{note}</p></div>
}

export default function Page() {
  const [active, setActive] = useState('Visão geral')
  const [query, setQuery] = useState('')
  const filtered = processos.filter((processo) => Object.values(processo).some((value) => value.toLowerCase().includes(query.toLowerCase())))

  return <div className="flex min-h-screen bg-[#f7f9f7] text-[#25312b]">
    <Sidebar active={active} onNavigate={setActive} />
    <div className="min-w-0 flex-1">
      <header className="flex h-[70px] items-center justify-between border-b border-[#e7e9e6] bg-white px-6 lg:px-10">
        <div className="flex items-center gap-3"><span className="text-sm font-medium text-[#66716b]">Silva & Associados</span><span className="text-[#c5cac6]">/</span><span className="text-sm text-[#9aa19c]">{active}</span></div>
        <div className="flex items-center gap-4"><button aria-label="Notificações" className="relative text-[#7b857e] hover:text-[#003020]"><Bell className="size-[18px]" strokeWidth={1.8} /><span className="absolute -right-0.5 -top-0.5 size-1.5 rounded-full bg-[#829b66]" /></button><div className="hidden h-5 w-px bg-[#e7e9e6] sm:block" /><span className="text-xs text-[#7b857e]">07 de outubro de 2026</span></div>
      </header>
      <main className="mx-auto max-w-[1440px] px-6 py-8 lg:px-10 lg:py-10">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-[#829b66]">Painel do escritório</p><h1 className="text-[28px] font-semibold tracking-[-0.04em] text-[#003020]">Visão geral</h1><p className="mt-2 text-sm text-[#78827c]">Acompanhe os processos e atividades do escritório.</p></div><button className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-[#003020] px-3.5 text-xs font-medium text-white transition-colors hover:bg-[#124c3a]"><Plus className="size-4" /> Novo processo</button></div>
        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Indicadores do escritório"><Stat value="128" label="Processos ativos" note="+8 desde o último mês" icon={BriefcaseBusiness} /><Stat value="84" label="Processos analisados" note="66% dos processos ativos" icon={ClipboardList} /><Stat value="1.284" label="Documentos" note="32 adicionados este mês" icon={FileText} /><Stat value="7" label="Pendências" note="3 com prazo nesta semana" icon={CheckCircle2} /></section>
        <section className="mt-8 rounded-lg border border-[#e5e9e5] bg-white"><div className="flex flex-col gap-4 border-b border-[#edf0ed] px-5 py-5 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-[15px] font-semibold text-[#1d2d25]">Processos recentes</h2><p className="mt-1 text-xs text-[#8a938d]">Acompanhe as últimas movimentações do escritório.</p></div><div className="flex items-center gap-2"><div className="relative"><Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[#9ca49f]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar processo" className="h-8 w-full rounded-md border border-[#e1e6e2] bg-[#fbfcfb] pl-9 pr-3 text-xs outline-none placeholder:text-[#a5aca7] focus:border-[#829b66] sm:w-[190px]" /></div><button aria-label="Filtrar processos" className="flex size-8 items-center justify-center rounded-md border border-[#e1e6e2] text-[#7c8780] hover:bg-[#f4f7f4]"><SlidersHorizontal className="size-3.5" /></button></div></div><div className="overflow-x-auto"><table className="w-full min-w-[800px] text-left"><thead className="bg-[#fbfcfb]"><tr className="border-b border-[#edf0ed] text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9aa19c]"><th className="px-5 py-3 font-medium">Número</th><th className="px-4 py-3 font-medium">Cliente</th><th className="px-4 py-3 font-medium">Tipo</th><th className="px-4 py-3 font-medium">Responsável</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium">Atualização</th><th className="px-3 py-3" /></tr></thead><tbody>{filtered.map((processo) => <tr key={processo.numero} className="border-b border-[#f0f2f0] text-[13px] last:border-0 hover:bg-[#fcfdfc]"><td className="px-5 py-4 font-medium text-[#315342]">{processo.numero}</td><td className="px-4 py-4 text-[#344139]">{processo.cliente}</td><td className="px-4 py-4 text-[#78827c]">{processo.tipo}</td><td className="px-4 py-4 text-[#78827c]">{processo.responsavel}</td><td className="px-4 py-4"><StatusBadge status={processo.status} /></td><td className="px-4 py-4 text-[#8b948e]">{processo.data}</td><td className="px-3 py-4"><button aria-label={`Mais opções para ${processo.numero}`} className="text-[#a1a8a3] hover:text-[#003020]"><MoreHorizontal className="size-4" /></button></td></tr>)}</tbody></table></div><div className="flex items-center justify-between border-t border-[#edf0ed] px-5 py-3"><span className="text-xs text-[#929a95]">Exibindo {filtered.length} de 128 processos</span><button onClick={() => setActive('Processos')} className="text-xs font-medium text-[#315f4a] hover:underline">Ver todos os processos</button></div></section>
        <section className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_1fr]"><div className="rounded-lg border border-[#e5e9e5] bg-white p-5"><div className="flex items-center justify-between"><div><h2 className="text-[15px] font-semibold text-[#1d2d25]">Atividade do escritório</h2><p className="mt-1 text-xs text-[#8a938d]">Movimentações dos últimos 7 dias.</p></div><button className="text-[#8a938d] hover:text-[#003020]" aria-label="Mais opções"><MoreHorizontal className="size-4" /></button></div><div className="mt-6 flex h-[116px] items-end gap-2 border-b border-[#e8ece8] px-2">{[42, 58, 35, 72, 54, 88, 64, 76, 48, 68, 82, 59, 92, 70].map((height, index) => <div key={index} className="group flex flex-1 flex-col items-center justify-end gap-2"><div className="w-full max-w-[18px] rounded-t-sm bg-[#dce7dc] transition-colors group-hover:bg-[#829b66]" style={{ height: `${height}%` }} /></div>)}</div><div className="mt-3 flex justify-between px-1 text-[10px] text-[#a1a9a3]"><span>01 out.</span><span>03 out.</span><span>05 out.</span><span>07 out.</span></div></div><div className="rounded-lg border border-[#e5e9e5] bg-white p-5"><div className="flex items-center justify-between"><div><h2 className="text-[15px] font-semibold text-[#1d2d25]">Próximos prazos</h2><p className="mt-1 text-xs text-[#8a938d]">Atenção necessária.</p></div><button className="text-xs font-medium text-[#315f4a] hover:underline">Ver agenda</button></div><div className="mt-5 flex flex-col gap-4"><div className="flex items-center gap-3"><div className="flex size-9 flex-col items-center justify-center rounded-md bg-[#f5f0e8] text-[#866b43]"><span className="text-[10px] font-medium">OUT</span><span className="text-sm font-semibold leading-3">08</span></div><div className="min-w-0 flex-1"><p className="truncate text-xs font-medium text-[#35433a]">Manifestação processual</p><p className="mt-1 text-[11px] text-[#969e98]">0001234-56.2026 · Amanhã</p></div></div><div className="flex items-center gap-3"><div className="flex size-9 flex-col items-center justify-center rounded-md bg-[#edf3ee] text-[#3b6950]"><span className="text-[10px] font-medium">OUT</span><span className="text-sm font-semibold leading-3">12</span></div><div className="min-w-0 flex-1"><p className="truncate text-xs font-medium text-[#35433a]">Audiência de conciliação</p><p className="mt-1 text-[11px] text-[#969e98]">0009876-12.2025 · Em 5 dias</p></div></div><div className="flex items-center gap-3"><div className="flex size-9 flex-col items-center justify-center rounded-md bg-[#f1f2ed] text-[#667054]"><span className="text-[10px] font-medium">OUT</span><span className="text-sm font-semibold leading-3">18</span></div><div className="min-w-0 flex-1"><p className="truncate text-xs font-medium text-[#35433a]">Prazo para recurso</p><p className="mt-1 text-[11px] text-[#969e98]">0014567-89.2024 · Em 11 dias</p></div></div></div></div></section>
      </main>
    </div>
  </div>
}

function _Unused() { return <div aria-hidden="true" className="hidden"><Search /></div> }

export { _Unused }
