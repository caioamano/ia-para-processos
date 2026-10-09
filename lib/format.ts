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
