import { supabase, isSupabaseConfigured } from './supabase'

const SESSION_KEY = 'obs_session_id'

function getSessionId(): string {
  let id = localStorage.getItem(SESSION_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(SESSION_KEY, id)
  }
  return id
}

// ── Curtidas ──────────────────────────────────────────────────────────────────

export async function getCurtidasCount(empreendimentoId: string): Promise<number> {
  if (!isSupabaseConfigured || !supabase) return 0
  const { count } = await supabase
    .from('curtidas')
    .select('*', { count: 'exact', head: true })
    .eq('empreendimento_id', empreendimentoId)
  return count ?? 0
}

export async function checkarCurtida(
  empreendimentoId: string,
  userId: string | null,
): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    return localStorage.getItem(`curtida_${empreendimentoId}`) === '1'
  }
  const sessionId = getSessionId()
  const query = supabase
    .from('curtidas')
    .select('id', { head: true, count: 'exact' })
    .eq('empreendimento_id', empreendimentoId)

  if (userId) {
    const { count } = await query.eq('user_id', userId)
    return (count ?? 0) > 0
  }
  const { count } = await query.eq('session_id', sessionId).is('user_id', null)
  return (count ?? 0) > 0
}

export async function toggleCurtida(
  empreendimentoId: string,
  userId: string | null,
  curtido: boolean,
): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    if (curtido) localStorage.removeItem(`curtida_${empreendimentoId}`)
    else localStorage.setItem(`curtida_${empreendimentoId}`, '1')
    return
  }

  const sessionId = getSessionId()

  if (curtido) {
    // Descurtir
    const query = supabase
      .from('curtidas')
      .delete()
      .eq('empreendimento_id', empreendimentoId)
    if (userId) await query.eq('user_id', userId)
    else await query.eq('session_id', sessionId).is('user_id', null)
  } else {
    // Curtir
    await supabase.from('curtidas').insert({
      empreendimento_id: empreendimentoId,
      user_id: userId ?? null,
      session_id: userId ? null : sessionId,
    })
  }
}

// ── Visualizações ─────────────────────────────────────────────────────────────

export async function registrarView(empreendimentoId: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return
  await supabase.from('visualizacoes').insert({ empreendimento_id: empreendimentoId })
}

// ── Métricas do dono (painel empresa) ────────────────────────────────────────

export async function getMetricasEmpresa(empreendimentoId: string) {
  if (!isSupabaseConfigured || !supabase) return null

  const [curtidas, views, curtidasSerie, viewsSerie] = await Promise.all([
    supabase
      .from('curtidas')
      .select('*', { count: 'exact', head: true })
      .eq('empreendimento_id', empreendimentoId),
    supabase
      .from('visualizacoes')
      .select('*', { count: 'exact', head: true })
      .eq('empreendimento_id', empreendimentoId),
    supabase.rpc('get_curtidas_serie', { p_empreendimento_id: empreendimentoId }),
    supabase.rpc('get_views_serie', { p_empreendimento_id: empreendimentoId }),
  ])

  return {
    curtidasTotal: curtidas.count ?? 0,
    viewsTotal: views.count ?? 0,
    curtidasSerie: (curtidasSerie.data ?? []) as { dia: string; total: number }[],
    viewsSerie: (viewsSerie.data ?? []) as { dia: string; total: number }[],
  }
}

// ── Métricas do admin ─────────────────────────────────────────────────────────

export async function getMetricasAdmin() {
  if (!isSupabaseConfigured || !supabase) return []
  const { data } = await supabase.rpc('get_metricas_admin')
  return (data ?? []) as {
    empreendimento_id: string
    curtidas_total: number
    views_total: number
    curtidas_mes: number
    views_mes: number
  }[]
}
