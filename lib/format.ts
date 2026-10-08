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
