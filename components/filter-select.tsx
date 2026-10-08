interface FilterSelectProps<T extends string> {
  label: string
  allLabel: string
  value: T | ''
  options: readonly T[]
  onChange: (value: T | '') => void
}

// Lista suspensa de filtro. O valor vazio ('') significa "todos".
export function FilterSelect<T extends string>({ label, allLabel, value, options, onChange }: FilterSelectProps<T>) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(event) => onChange(event.target.value as T | '')}
      className="h-8 rounded-md border border-input bg-muted px-2.5 text-xs text-foreground outline-none focus:border-olive"
    >
      <option value="">{allLabel}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  )
}
