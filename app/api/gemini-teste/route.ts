import { NextResponse } from 'next/server'

import { getSession } from '@/lib/data/queries'
import { createGemini, geminiConfigured, geminiModel } from '@/lib/gemini'

// Rota TEMPORÁRIA só para conferir se a chave do Gemini está funcionando.
// Abra https://ia-para-processos.vercel.app/api/gemini-teste logado como Administrador.
// Depois que a Fase 9 estiver funcionando, esta pasta (app/api/gemini-teste) pode ser apagada.
// Não envia nenhum dado do escritório ao Gemini: a pergunta é fixa.
export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ ok: false, error: 'Entre no sistema primeiro.' }, { status: 401 })
  if (session.user.role !== 'Administrador') {
    return NextResponse.json({ ok: false, error: 'Só o Administrador pode usar este teste.' }, { status: 403 })
  }
  if (!geminiConfigured()) {
    return NextResponse.json(
      { ok: false, error: 'A variável GEMINI_API_KEY não está configurada na Vercel (ou falta um novo deploy).' },
      { status: 500 },
    )
  }

  const model = geminiModel()
  try {
    const response = await createGemini().models.generateContent({
      model,
      contents: 'Responda apenas com a palavra: funcionando',
    })
    return NextResponse.json({ ok: true, model, resposta: response.text ?? '' })
  } catch (error) {
    // O detalhe técnico fica nos logs da Vercel; a tela mostra só o essencial.
    console.error('Falha no teste do Gemini:', error)
    return NextResponse.json(
      { ok: false, model, error: 'O Gemini recusou ou falhou. Confira a chave e o nome do modelo (veja os logs da Vercel).' },
      { status: 502 },
    )
  }
}
