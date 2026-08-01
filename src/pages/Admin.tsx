import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { getMetricasAdmin } from '../lib/metricas'
import { SectionTitle } from '../components/ui'
import type { Empreendimento } from '../data/types'

interface MetricaItem {
  empreendimento_id: string
  curtidas_total: number
  views_total: number
  curtidas_mes: number
  views_mes: number
}

export default function Admin() {
  const { user, profile, loading, signOut } = useAuth()
  const [empreendimentos, setEmpreendimentos] = useState<Empreendimento[]>([])
  const [metricas, setMetricas] = useState<MetricaItem[]>([])
  const [carregando, setCarregando] = useState(true)
  const [atualizando, setAtualizando] = useState<string | null>(null)
  const [filtro, setFiltro] = useState<'todos' | 'pendentes' | 'aprovados'>('todos')

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return
    if (profile?.role !== 'admin') return

    async function carregar() {
      const [{ data: emps }, metricasDados] = await Promise.all([
        supabase!.from('empreendimentos').select('*').order('aprovado').order('nome'),
        getMetricasAdmin(),
      ])
      if (emps) {
        setEmpreendimentos(emps.map((e: Record<string, unknown>) => ({
          id: e.id as string,
          nome: e.nome as string,
          municipioCodigo: e.municipio_codigo as string,
          categoria: e.categoria as string,
          historia: (e.historia as string) ?? '',
          produtos: (e.produtos as string[]) ?? [],
          contato: {
            telefone: (e.telefone as string) ?? '',
            email: (e.email as string) ?? '',
            instagram: (e.instagram as string) ?? undefined,
          },
          destaque: Boolean(e.destaque),
          aprovado: Boolean(e.aprovado),
          cor: (e.cor as string) ?? '#256b3d',
        })))
      }
      setMetricas(metricasDados)
      setCarregando(false)
    }
    carregar()
  }, [profile])

  async function toggleAprovacao(id: string, aprovado: boolean) {
    if (!supabase) return
    setAtualizando(id)
    await supabase.from('empreendimentos').update({ aprovado: !aprovado }).eq('id', id)
    setEmpreendimentos((prev) =>
      prev.map((e) => (e.id === id ? { ...e, aprovado: !aprovado } : e)),
    )
    setAtualizando(null)
  }

  if (loading) return <div className="container-page py-20 text-center text-forest-500">Carregando…</div>
  if (!user) return <Navigate to="/entrar" replace />
  if (profile && profile.role !== 'admin') return <Navigate to="/painel" replace />

  const filtrados = empreendimentos.filter((e) => {
    if (filtro === 'pendentes') return !e.aprovado
    if (filtro === 'aprovados') return e.aprovado
    return true
  })

  const metricaMap = Object.fromEntries(metricas.map((m) => [m.empreendimento_id, m]))

  const pendentes = empreendimentos.filter((e) => !e.aprovado).length
  const totalCurtidas = metricas.reduce((a, m) => a + m.curtidas_total, 0)
  const totalViews = metricas.reduce((a, m) => a + m.views_total, 0)

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="flex items-start justify-between">
        <SectionTitle
          eyebrow="Administrador"
          title="Painel de controle"
          desc="Gerencie os empreendimentos e acompanhe as métricas da plataforma."
        />
        <button
          onClick={signOut}
          className="btn-ghost mt-1 text-sm"
        >
          Sair
        </button>
      </div>

      {/* Resumo geral */}
      <div className="mt-8 grid gap-4 sm:grid-cols-4">
        <ResumoCard label="Empreendimentos" value={empreendimentos.length} icon="🏪" />
        <ResumoCard label="Pendentes de aprovação" value={pendentes} icon="⏳" destaque={pendentes > 0} />
        <ResumoCard label="Curtidas totais" value={totalCurtidas} icon="❤️" />
        <ResumoCard label="Visualizações totais" value={totalViews} icon="👁️" />
      </div>

      {/* Filtros */}
      <div className="mt-8 flex items-center gap-2">
        {([
          { id: 'todos', label: 'Todos' },
          { id: 'pendentes', label: `Pendentes (${pendentes})` },
          { id: 'aprovados', label: 'Aprovados' },
        ] as const).map((f) => (
          <button
            key={f.id}
            onClick={() => setFiltro(f.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-600 transition ${
              filtro === f.id
                ? 'bg-forest-700 text-white'
                : 'bg-forest-100 text-forest-600 hover:bg-forest-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Tabela */}
      {!isSupabaseConfigured ? (
        <div className="card mt-6 p-8 text-center text-forest-500">
          Configure o Supabase para ver dados reais.
        </div>
      ) : carregando ? (
        <div className="mt-10 text-center text-forest-500">Carregando empreendimentos…</div>
      ) : (
        <div className="mt-4 space-y-3">
          {filtrados.map((e) => {
            const m = metricaMap[e.id]
            return (
              <div
                key={e.id}
                className={`card grid gap-4 p-5 lg:grid-cols-[1fr_auto] ${
                  !e.aprovado ? 'border-l-4 border-sun-400' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="h-10 w-10 shrink-0 rounded-lg"
                    style={{ background: `linear-gradient(135deg, ${e.cor}, #0a2015)` }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-display font-700 text-forest-800">{e.nome}</p>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-600 ${
                        e.aprovado ? 'bg-forest-100 text-forest-700' : 'bg-sun-500/20 text-sun-600'
                      }`}>
                        {e.aprovado ? 'Publicado' : 'Pendente'}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-forest-500">{e.categoria} · {e.contato.email}</p>
                    <p className="mt-1 line-clamp-1 text-xs text-forest-400">{e.historia}</p>

                    {/* Métricas inline */}
                    {m && (
                      <div className="mt-2 flex flex-wrap gap-4 text-xs text-forest-500">
                        <span>❤️ {m.curtidas_total} curtidas ({m.curtidas_mes} este mês)</span>
                        <span>👁️ {m.views_total} views ({m.views_mes} este mês)</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <a
                    href={`/vitrine/${e.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-ghost text-xs"
                  >
                    Ver
                  </a>
                  <button
                    onClick={() => toggleAprovacao(e.id, e.aprovado)}
                    disabled={atualizando === e.id}
                    className={`rounded-lg px-4 py-1.5 text-sm font-600 transition ${
                      e.aprovado
                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                        : 'bg-forest-600 text-white hover:bg-forest-700'
                    }`}
                  >
                    {atualizando === e.id
                      ? '…'
                      : e.aprovado
                      ? 'Reprovar'
                      : 'Aprovar'}
                  </button>
                </div>
              </div>
            )
          })}

          {filtrados.length === 0 && (
            <p className="rounded-xl border border-dashed border-forest-200 bg-forest-50 p-8 text-center text-forest-500">
              Nenhum empreendimento nesta categoria.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function ResumoCard({
  label,
  value,
  icon,
  destaque,
}: {
  label: string
  value: number
  icon: string
  destaque?: boolean
}) {
  return (
    <div className={`card p-5 ${destaque ? 'border-sun-400 bg-sun-500/5' : ''}`}>
      <span className="text-xl">{icon}</span>
      <p className="mt-2 font-display text-3xl font-800 text-forest-800">{value}</p>
      <p className="mt-1 text-xs text-forest-500">{label}</p>
    </div>
  )
}
