import type { ReactNode } from 'react'
import { Info } from 'lucide-react'

// Aviso de que a tela ainda usa dados fictícios. Sem texto próprio, mostra a mensagem padrão.
export function DemoNotice({ children }: { children?: ReactNode }) {
  return (
    <div className="mt-6 flex items-start gap-3 rounded-lg border border-border bg-muted px-4 py-3">
      <Info className="mt-0.5 size-4 shrink-0 text-olive" strokeWidth={1.8} />
      <p className="text-xs leading-5 text-muted-foreground">
        <span className="font-medium text-foreground">Conteúdo de demonstração.</span>{' '}
        {children ??
          'Os dados desta tela são fictícios e ainda não há leitura automática de documentos. Ela serve para validar o layout.'}
      </p>
    </div>
  )
}
