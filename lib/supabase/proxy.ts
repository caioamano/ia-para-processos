import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Roda a cada acesso ao site (chamado pelo proxy.ts da raiz). Faz duas coisas:
// 1) renova a sessão do login quando necessário (o Supabase guarda a sessão em cookies);
// 2) decide quem pode ver o quê: sem login só vê /login; com login não precisa do /login.
export async function updateSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  // Se faltar configuração, o site "fecha" em vez de abrir sem proteção.
  if (!url || !key) {
    return new NextResponse(
      'Configuração do Supabase ausente: defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.',
      { status: 500 },
    )
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        )
      },
    },
  })

  // getClaims() confere a assinatura do login. Não use getSession() aqui: ele
  // só lê o cookie e não prova que o login é verdadeiro.
  const { data } = await supabase.auth.getClaims()
  const isLoggedIn = Boolean(data?.claims)
  const isLoginPage = request.nextUrl.pathname === '/login'

  function redirectTo(path: string) {
    const redirect = NextResponse.redirect(new URL(path, request.url))
    // Mantém os cookies de sessão renovados também no redirecionamento.
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie))
    return redirect
  }

  if (!isLoggedIn && !isLoginPage) return redirectTo('/login')
  if (isLoggedIn && isLoginPage) return redirectTo('/dashboard')

  return response
}
