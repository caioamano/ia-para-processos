'use client'

import { useActionState, type ReactNode } from 'react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { createProcess } from '@/app/(app)/processos/novo/actions'
import { EMPTY_FORM_VALUES, type FormField, type FormState } from '@/lib/process-form'
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
}

const inputClass =
  'mt-1.5 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-subtle focus:border-ring focus:ring-3 focus:ring-ring/30'

function Field({ label, htmlFor, error, hint, children }: { label: string; htmlFor: string; error?: string; hint?: string; children: ReactNode }) {
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

export function NewProcessForm({ members, currentUserId, today }: NewProcessFormProps) {
  // useActionState liga o formulário à função do servidor (actions.ts) e guarda o resultado.
  const [state, formAction, pending] = useActionState<FormState, FormData>(createProcess, {
    values: { ...EMPTY_FORM_VALUES, responsibleId: currentUserId },
  })

  const errors = state.fieldErrors ?? {}
  const value = (field: FormField) => state.values[field]

  return (
    <form action={formAction} className="rounded-lg border border-border bg-card p-6" noValidate>
      {state.error && (
        <p role="alert" className="mb-5 rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Número do processo *" htmlFor="number" error={errors.number} hint="Numeração única do CNJ. Pode colar só os 20 números.">
            <input id="number" name="number" inputMode="numeric" maxLength={30} placeholder="0000000-00.0000.0.00.0000" defaultValue={value('number')} className={inputClass} />
          </Field>
        </div>

        <Field label="Cliente *" htmlFor="client" error={errors.client}>
          <input id="client" name="client" maxLength={160} defaultValue={value('client')} className={inputClass} />
        </Field>

        <Field label="Parte contrária" htmlFor="counterparty" error={errors.counterparty}>
          <input id="counterparty" name="counterparty" maxLength={160} defaultValue={value('counterparty')} className={inputClass} />
        </Field>

        <Field label="Tipo *" htmlFor="type" error={errors.type}>
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

        <Field label="Juízo" htmlFor="court" error={errors.court} hint="Ex.: 3ª Vara Cível">
          <input id="court" name="court" maxLength={120} defaultValue={value('court')} className={inputClass} />
        </Field>

        <Field label="Valor da causa (R$)" htmlFor="caseValue" error={errors.caseValue} hint="Ex.: 85.000,00">
          <input id="caseValue" name="caseValue" inputMode="decimal" defaultValue={value('caseValue')} className={inputClass} />
        </Field>

        <Field label="Data de distribuição" htmlFor="distributedAt" error={errors.distributedAt}>
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
