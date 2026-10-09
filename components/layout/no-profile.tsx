'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

// Tela mostrada quando o login funciona, mas a conta ainda não está ligada a um perfil
// de escritório (coluna auth_user_id vazia em "profiles"). Sem isso o banco não mostra nada.
export function NoProfile() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSignOut() {
    setLoading(true)
    await createClient().auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted px-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 text-center">
        <h1 className="text-base font-semibold text-foreground">Conta ainda sem escritório</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Seu login está correto, mas ele ainda não foi vinculado a um perfil de escritório. Peça ao administrador para
          concluir o vínculo e entre novamente.
        </p>
        <Button onClick={handleSignOut} disabled={loading} className="mt-5">
          {loading ? 'Saindo…' : 'Sair'}
        </Button>
      </div>
    </main>
  )
}
