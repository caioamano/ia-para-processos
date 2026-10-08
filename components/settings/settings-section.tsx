import type { ReactNode } from 'react'

interface SettingsSectionProps {
  title: string
  description: string
  children: ReactNode
}

export function SettingsSection({ title, description, children }: SettingsSectionProps) {
  return (
    <section className="mt-6 rounded-lg border border-border bg-card">
      <div className="border-b border-line px-5 py-5">
        <h2 className="text-[15px] font-semibold text-foreground">{title}</h2>
        <p className="mt-1 text-xs text-subtle">{description}</p>
      </div>
      <div className="p-5">{children}</div>
    </section>
  )
}
