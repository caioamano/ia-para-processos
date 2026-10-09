import { createBrowserClient } from '@supabase/ssr'

// Cliente do Supabase para usar DENTRO do navegador (telas com 'use client').
// Usa só a chave pública (publishable). Ela é segura no navegador porque quem
// protege os dados é o RLS do banco. NUNCA coloque aqui a chave service_role/secret.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  )
}
