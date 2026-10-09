'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

import { createClient } from '@/lib/supabase/client'

// Botão "Sair": encerra o login e volta para a tela /login.
export function SignOutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSignOut() {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      className="mt-1 flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-[12px] text-muted-foreground transition-colors hover:bg-accent hover:text-primary disabled:opacity-50"
    >
      <LogOut className="size-3.5" strokeWidth={1.8} />
      {loading ? 'Saindo…' : 'Sair'}
    </button>
  )
}
