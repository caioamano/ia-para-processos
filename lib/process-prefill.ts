import type { ProcessExtraction } from './process-extraction'

// Fase 9C: transforma o que o Gemini leu (já conferido em process-extraction.ts) em valores
// para o formulário "Novo processo". Sem React, sem banco e sem Gemini: fácil de testar.

// O PDF do rascunho fica numa subpasta do escritório (a regra do Storage olha só a 1ª pasta):
// <escritório>/rascunhos/<id>.pdf. Quando o processo é cadastrado, o arquivo é copiado para o
// caminho definitivo do documento e o rascunho é apagado.
export function draftStoragePath(officeId: string, draftId: string) {
  return `${officeId}/rascunhos/${draftId}.pdf`
}

// "MARINA TEIXEIRA SOUZA" -> "Marina Teixeira Souza"; "CONSTRUTORA HORIZONTE LTDA" -> "Construtora Horizonte LTDA".
// Só mexe em nomes TODOS em maiúsculas (como vêm nas petições). Se já estiver misturado, respeita.
const LOWERCASE_WORDS = new Set(['de', 'da', 'do', 'das', 'dos', 'e'])
const KEEP_UPPERCASE = new Set(['ltda', 'me', 'epp', 'eireli', 'mei', 'sa', 's/a', 's.a.', 's.a', 'cia', 'ii', 'iii', 'iv'])

export function prettyName(name: string) {
  const letters = name.replace(/[^\p{L}]/gu, '')
  if (letters === '' || letters !== letters.toUpperCase()) return name

  return name
    .toLowerCase()
    .split(' ')
    .map((word, index) => {
      if (KEEP_UPPERCASE.has(word)) return word.toUpperCase()
      if (index > 0 && LOWERCASE_WORDS.has(word)) return word
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(' ')
}

// Várias partes no mesmo polo: "Ana e Bruno". Se passar de 160 caracteres (limite do campo),
// fica o primeiro nome + "e outros".
export function joinParties(names: string[]) {
  const pretty = names.map(prettyName)
  if (pretty.length <= 1) return pretty[0] ?? ''
  const joined = `${pretty.slice(0, -1).join(', ')} e ${pretty[pretty.length - 1]}`
  return joined.length <= 160 ? joined : `${pretty[0]} e outros`
}

export function formatMoneyBR(value: number) {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// De onde saiu cada campo: mostrado embaixo do campo no formulário.
export interface PrefillSource {
  page: number | null
  evidence: string | null
}

export type PrefillField = 'number' | 'type' | 'court' | 'caseValue' | 'distributedAt'

export interface Prefill {
  values: Record<PrefillField, string>
  sources: Partial<Record<PrefillField, PrefillSource>>
  // Quem é o cliente do escritório NÃO está no documento: o advogado escolhe o polo.
  active: { names: string }
  passive: { names: string }
  activeSource: PrefillSource | null
  passiveSource: PrefillSource | null
  actionName: string | null
  warnings: string[]
}

export function buildPrefill(extraction: ProcessExtraction): Prefill {
  const source = (field: { page: number | null; evidence: string | null } | null): PrefillSource | null =>
    field ? { page: field.page, evidence: field.evidence } : null

  const sources: Prefill['sources'] = {}
  const set = (key: PrefillField, field: { page: number | null; evidence: string | null } | null) => {
    const s = source(field)
    if (s) sources[key] = s
  }
  set('number', extraction.number)
  set('type', extraction.processType)
  set('court', extraction.court)
  set('caseValue', extraction.caseValue)
  set('distributedAt', extraction.distributedAt)

  const first = (list: ProcessExtraction['activeParties']) => source(list[0] ?? null)

  return {
    values: {
      number: extraction.number?.value ?? '',
      type: extraction.processType?.value ?? '',
      court: extraction.court?.value ?? '',
      caseValue: extraction.caseValue ? formatMoneyBR(extraction.caseValue.value) : '',
      distributedAt: extraction.distributedAt?.value ?? '',
    },
    sources,
    active: { names: joinParties(extraction.activeParties.map((party) => party.value)) },
    passive: { names: joinParties(extraction.passiveParties.map((party) => party.value)) },
    activeSource: first(extraction.activeParties),
    passiveSource: first(extraction.passiveParties),
    actionName: extraction.actionName?.value ?? null,
    warnings: extraction.warnings,
  }
}
