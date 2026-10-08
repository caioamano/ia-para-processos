import { redirect } from 'next/navigation'

// Por enquanto a raiz do site leva direto ao painel.
// Mais adiante, este arquivo vira a landing page pública.
export default function HomePage() {
  redirect('/dashboard')
}
