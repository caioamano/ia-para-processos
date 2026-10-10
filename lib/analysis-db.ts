import 'server-only'

import type { createClient } from '@/lib/supabase/server'

type Supabase = Awaited<ReturnType<typeof createClient>>

// Atualiza a situação da análise do processo a partir do que existe de fato:
//   algum documento "Em processamento" -> "Em processamento";
//   senão, se há itens -> "Concluída"; senão -> "Pendente".
// Não faz nada se o processo ainda não tem análise.
export async function syncAnalysisStatus(supabase: Supabase, processId: string) {
  const { data: analysis } = await supabase.from('analyses').select('id').eq('process_id', processId).maybeSingle()
  if (!analysis) return

  const [{ count: processing }, { count: items }] = await Promise.all([
    supabase
      .from('documents')
      .select('id', { count: 'exact', head: true })
      .eq('process_id', processId)
      .eq('status', 'Em processamento'),
    supabase.from('analysis_items').select('id', { count: 'exact', head: true }).eq('analysis_id', analysis.id),
  ])

  const status = (processing ?? 0) > 0 ? 'Em processamento' : (items ?? 0) > 0 ? 'Concluída' : 'Pendente'
  await supabase.from('analyses').update({ status, updated_at: new Date().toISOString() }).eq('id', analysis.id)
}
