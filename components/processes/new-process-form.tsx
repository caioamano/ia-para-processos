'use client'

import { useActionState, useState, type ReactNode } from 'react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { createProcess } from '@/app/(app)/processos/novo/actions'
import { EMPTY_FORM_VALUES, type FormField, type FormState } from '@/lib/process-form'
import type { Prefill, PrefillField } from '@/lib/process-prefill'
import { PROCESS_STATUSES, PROCESS_TYPES } from '@/lib/types'

interface Member {
  id: string
  name: string
  role: string
}

interface NewProcessFormProps {
  members: Member[]
  currentUserId: string
  today: string
  // Preenchimento vindo da leitura de um PDF (opcional) e o rascunho do PDF a anexar ao cadastrar.
  prefill?: Prefill
  draft?: { id: string; fileName: string }
}

const inputClass =
  'mt-1.5 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-subtle focus:border-ring focus:ring-3 focus:ring-ring/30'

function Field({ label, htmlFor, error, hint, children }: { label: string; htmlFor: string; error?: string; hint?: ReactNode; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="text-[13px] font-medium text-foreground">
        {label}
      </label>
      {children}
      {error ? (
        <p role="alert" className="mt-1.5 text-xs text-destructive">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-subtle">{hint}</p>
      )}
    </div>
  )
}

// "Lido do PDF, p. 3: “Dá-se à causa o valor de R$ 48.500,00”" — mostrado embaixo do campo preenchido.
function sourceHint(prefill: Prefill | undefined, field: PrefillField, fallback?: string): ReactNode {
  const source = prefill?.sources[field]
  if (!source || !prefill?.values[field]) return fallback
  const evidence = source.evidence && source.evidence.length > 100 ? `${source.evidence.slice(0, 100)}…` : source.evidence
  return `Lido do PDF${source.page ? `, p. ${source.page}` : ''}${evidence ? `: “${evidence}”` : ''}`
}

export function NewProcessForm({ members, currentUserId, today, prefill, draft }: NewProcessFormProps) {
  // useActionState liga o formulário à função do servidor (actions.ts) e guarda o resultado.
  const [state, formAction, pending] = useActionState<FormState, FormData>(createProcess, {
    values: { ...EMPTY_FORM_VALUES, responsibleId: currentUserId, ...prefill?.values },
  })

  // Cliente e parte contrária são "controlados" para o seletor de polo (autor/réu) poder preenchê-los.
  const [client, setClient] = useState(state.values.client)
  const [counterparty, setCounterparty] = useState(state.values.counterparty)
  const [side, setSide] = useState<'active' | 'passive' | null>(null)

  function chooseSide(next: 'active' | 'passive') {
    if (!prefill) return
    setSide(next)
    setClient(next === 'active' ? prefill.active.names : prefill.passive.names)
    setCounterparty(next === 'active' ? prefill.passive.names : prefill.active.names)
  }

  const errors = state.fieldErrors ?? {}
  const value = (field: FormField) => state.values[field]

  return (
    <form action={formAction} className="rounded-lg border border-border bg-card p-6" noValidate>
      {state.error && (
        <p role="alert" className="mb-5 rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {state.error}
        </p>
      )}

      {draft && (
        <>
          <input type="hidden" name="draftId" value={draft.id} />
          <input type="hidden" name="draftFileName" value={draft.fileName} />
        </>
      )}

      {prefill && (
        <div className="mb-5 rounded-lg border border-border bg-muted px-4 py-3 text-sm text-foreground">
          <p className="font-medium">Dados lidos automaticamente do PDF. Confira cada campo antes de cadastrar.</p>
          {prefill.actionName && <p className="mt-1 text-xs text-muted-foreground">Ação identificada: {prefill.actionName}</p>}
          {prefill.warnings.length > 0 && (
            <ul className="mt-2 list-disc space-y-0.5 pl-5 text-xs text-muted-foreground">
              {prefill.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          )}
          <p className="mt-1.5 text-xs text-muted-foreground">O PDF será anexado ao processo quando você cadastrar.</p>
        </div>
      )}

      {prefill && (prefill.active.names || prefill.passive.names) && (
        <fieldset className="mb-5 rounded-lg border border-border p-4">
          <legend className="px-1 text-[13px] font-medium text-foreground">Quem é o seu cliente neste processo?</legend>
          <div className="mt-1 grid gap-2 sm:grid-cols-2">
            {(
              [
                ['active', 'Autor', prefill.active.names, prefill.activeSource],
                ['passive', 'Réu', prefill.passive.names, prefill.passiveSource],
              ] as const
            ).map(([key, label, names, source]) => (
              <label
                key={key}
                className={`flex cursor-pointer items-start gap-2.5 rounded-lg border px-3 py-2.5 text-sm ${names ? '' : 'opacity-50'} ${side === key ? 'border-primary bg-card' : 'border-input'}`}
              >
                <input
                  type="radio"
                  name="side"
                  checked={side === key}
                  disabled={!names}
                  onChange={() => chooseSide(key)}
                  className="mt-1"
                />
                <span>
                  <span className="font-medium">{label}</span>
                  <span className="block text-foreground">{names || 'não identificado no PDF'}</span>
                  {names && source?.page && <span className="block text-xs text-subtle">Lido do PDF, p. {source.page}</span>}
                </span>
              </label>
            ))}
          </div>
          <p className="mt-2 text-xs text-subtle">Isso preenche &quot;Cliente&quot; e &quot;Parte contrária&quot;. O documento não diz quem é o seu cliente.</p>
        </fieldset>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field
            label="Número do processo *"
            htmlFor="number"
            error={errors.number}
            hint={sourceHint(prefill, "number", "Numeração única do CNJ. Pode colar só os 20 números.")}
          >
            <input id="number" name="number" inputMode="numeric" maxLength={30} placeholder="0000000-00.0000.0.00.0000" defaultValue={value('number')} className={inputClass} />
          </Field>
        </div>

        <Field label="Cliente *" htmlFor="client" error={errors.client}>
          <input id="client" name="client" maxLength={160} value={client} onChange={(event) => setClient(event.target.value)} className={inputClass} />
        </Field>

        <Field label="Parte contrária" htmlFor="counterparty" error={errors.counterparty}>
          <input id="counterparty" name="counterparty" maxLength={160} value={counterparty} onChange={(event) => setCounterparty(event.target.value)} className={inputClass} />
        </Field>

        <Field label="Tipo *" htmlFor="type" error={errors.type} hint={sourceHint(prefill, "type")}>
          <select id="type" name="type" defaultValue={value('type')} className={inputClass}>
            <option value="">Selecione</option>
            {PROCESS_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Situação *" htmlFor="status" error={errors.status}>
          <select id="status" name="status" defaultValue={value('status')} className={inputClass}>
            {PROCESS_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Responsável *" htmlFor="responsibleId" error={errors.responsibleId}>
          <select id="responsibleId" name="responsibleId" defaultValue={value('responsibleId')} className={inputClass}>
            <option value="">Selecione</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name} · {member.role}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Juízo" htmlFor="court" error={errors.court} hint={sourceHint(prefill, "court", "Ex.: 3ª Vara Cível")}>
          <input id="court" name="court" maxLength={120} defaultValue={value('court')} className={inputClass} />
        </Field>

        <Field label="Valor da causa (R$)" htmlFor="caseValue" error={errors.caseValue} hint={sourceHint(prefill, "caseValue", "Ex.: 85.000,00")}>
          <input id="caseValue" name="caseValue" inputMode="decimal" defaultValue={value('caseValue')} className={inputClass} />
        </Field>

        <Field label="Data de distribuição" htmlFor="distributedAt" error={errors.distributedAt} hint={sourceHint(prefill, "distributedAt")}>
          <input id="distributedAt" name="distributedAt" type="date" max={today} defaultValue={value('distributedAt')} className={inputClass} />
        </Field>
      </div>

      <div className="mt-7 flex items-center gap-3">
        <Button type="submit" size="lg" disabled={pending} className="h-10 px-5">
          {pending ? 'Cadastrando…' : 'Cadastrar processo'}
        </Button>
        <Link href="/processos" className="text-sm font-medium text-muted-foreground hover:text-primary">
          Cancelar
        </Link>
      </div>
    </form>
  )
}
