// Funções de formatação usadas em várias telas.

const monthLabels = ['jan.', 'fev.', 'mar.', 'abr.', 'mai.', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.']

// Usa getUTC* de propósito: o resultado é igual no servidor e no navegador,
// independente do fuso horário de cada um.
export function formatDate(date: Date) {
  return `${date.getUTCDate()} ${monthLabels[date.getUTCMonth()]} ${date.getUTCFullYear()}`
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

// ---------- Datas e tamanhos vindos do banco ----------

const TIME_ZONE = 'America/Sao_Paulo'

// Uma data "sem hora" do banco (ex.: "2026-09-13", coluna do tipo date).
export function formatDateOnly(value: string) {
  return formatDate(new Date(`${value}T00:00:00Z`))
}

// Separa um instante (timestamptz do banco) em ano, mês, dia, hora e minuto no horário de Brasília.
function partsInSaoPaulo(value: string | Date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(value))
  const get = (type: string) => Number(parts.find((part) => part.type === type)?.value)
  return { year: get('year'), month: get('month'), day: get('day'), hour: get('hour'), minute: get('minute') }
}

// Data de um instante, no horário de Brasília. Ex.: "13 set. 2026".
export function formatTimestampDate(value: string) {
  const { year, month, day } = partsInSaoPaulo(value)
  return formatDate(new Date(Date.UTC(year, month - 1, day)))
}

// "Hoje, 09:42", "Ontem, 16:18" ou "18 set. 2026" (igual ao que a interface já mostrava).
export function formatTimestamp(value: string) {
  const then = partsInSaoPaulo(value)
  const now = partsInSaoPaulo(new Date())
  const dayNumber = (p: { year: number; month: number; day: number }) => Date.UTC(p.year, p.month - 1, p.day)
  const diffDays = Math.round((dayNumber(now) - dayNumber(then)) / 86_400_000)
  const time = `${String(then.hour).padStart(2, '0')}:${String(then.minute).padStart(2, '0')}`

  if (diffDays === 0) return `Hoje, ${time}`
  if (diffDays === 1) return `Ontem, ${time}`
  return formatTimestampDate(value)
}

// 1536000 -> "1,5 MB"; 90000 -> "88 KB"
export function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

// ---------- Datas "de hoje" no horário de Brasília ----------

// Hoje, no formato do banco: "2026-10-08".
export function todayInSaoPaulo() {
  const { year, month, day } = partsInSaoPaulo(new Date())
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

// Soma dias a uma data "2026-10-08" e devolve no mesmo formato.
export function addDaysToDateOnly(value: string, days: number) {
  const date = new Date(`${value}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

// Quantos dias faltam de uma data para outra (negativo se já passou).
export function daysBetweenDateOnly(from: string, to: string) {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000)
}

// "8 de outubro de 2026" (barra superior).
export function formatLongDate(value: Date) {
  return new Intl.DateTimeFormat('pt-BR', { timeZone: TIME_ZONE, day: 'numeric', month: 'long', year: 'numeric' }).format(value)
}

// Mês abreviado em maiúsculas ("OUT") e dia com dois dígitos ("08"), para o cartão de prazos.
export function deadlineBadge(value: string) {
  const [, month, day] = value.split('-')
  return { month: monthLabels[Number(month) - 1].replace('.', '').toUpperCase(), day }
}
