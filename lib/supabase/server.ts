import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Cliente do Supabase para usar no SERVIDOR (páginas e funções que rodam no servidor).
// Ele lê o login do usuário nos cookies e o envia ao banco. Com isso o RLS sabe
// QUEM está pedindo e devolve só os dados do escritório dele.
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // Páginas não podem gravar cookies; quem renova a sessão é o proxy.ts. Pode ignorar.
          }
        },
      },
    },
  )
}
