interface TextFieldProps {
  id: string
  label: string
  defaultValue: string
  type?: string
}

export function TextField({ id, label, defaultValue, type = 'text' }: TextFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="text-[10px] font-semibold uppercase tracking-[0.1em] text-subtle">
        {label}
      </label>
      <input
        id={id}
        type={type}
        defaultValue={defaultValue}
        className="mt-1.5 h-9 w-full rounded-md border border-input bg-muted px-3 text-[13px] text-foreground outline-none focus:border-olive"
      />
    </div>
  )
}
