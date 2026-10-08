import type { Metadata } from 'next'

import { Hero } from '@/components/landing/hero'
import { HowItWorks } from '@/components/landing/how-it-works'
import { SiteFooter } from '@/components/landing/site-footer'
import { SiteHeader } from '@/components/landing/site-header'
import { TrustSection } from '@/components/landing/trust-section'

// "absolute" ignora o modelo "%s · LexIA" definido no layout: aqui o título é próprio.
export const metadata: Metadata = {
  title: { absolute: 'LexIA — organize e consulte processos jurídicos' },
}

// Página pública (landing page). Até a Fase 5 (autenticação), o botão "Acessar o sistema"
// leva direto ao painel.
export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main>
        <Hero />
        <HowItWorks />
        <TrustSection />
      </main>
      <SiteFooter />
    </div>
  )
}
