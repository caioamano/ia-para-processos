import type { NextRequest } from 'next/server'

import { updateSession } from '@/lib/supabase/proxy'

// No Next.js 16 este arquivo (proxy.ts, na raiz) substitui o antigo middleware.ts.
// Ele roda antes de cada página e protege o painel.
export async function proxy(request: NextRequest) {
  return updateSession(request)
}

export const config = {
  // Ignora arquivos internos do Next e imagens da pasta public.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
}
