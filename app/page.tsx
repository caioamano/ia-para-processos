import { redirect } from 'next/navigation'
 
// Por enquanto a raiz do site leva direto ao painel.
// A landing page pública será criada depois que o sistema estiver pronto.
export default function HomePage() {
  redirect('/dashboard')
}
 
