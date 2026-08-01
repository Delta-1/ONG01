import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { useAuth } from '../contexts/AuthContext'
import { useEmpreendimentos } from '../hooks/useData'
import { getMetricasEmpresa } from '../lib/metricas'
import { SectionTitle } from '../components/ui'
import { isSupabaseConfigured } from '../lib/supabase'

interface Metricas {
  curtidasTotal: number
  viewsTotal: number
  curtidasSerie: { dia: string; total: number }[]
  viewsSerie: { dia: string; total: number }[]
}

function fmtDia(iso: string) {
  const d = new Date(iso)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
}

function mergeSeriesPorDia(
  curtidas: { dia: string; total: number }[],
  views: { dia: string; total: number }[],
) {
  const map: Record<string, { dia: string; curtidas: number; views: number }> = {}
  curtidas.forEach(({ dia, total }) => {
    map[dia] = { dia, curtidas: total, views: 0 }
  })
  views.forEach(({ dia, total }) => {
    if (!map[dia]) map[dia] = { dia, curtidas: 0, views: 0 }
    map[dia].views = total
  })
  return Object.values(map).sort((a, b) => a.dia.localeCompare(b.dia))
}

export default function Painel() {
  const { user, profile, loading, signOut } = useAuth()
  const navigate = useNavigate()
  const empreendimentos = useEmpreendimentos()
  const [metricas, setMetricas] = useState<Metricas | null>(null)
  const [carregando, setCarregando] = useState(true)

  const meuEmpreendimentoId = profile?.empreendimento_id
  const meuEmpreendimento = empreendimentos.find((e) => e.id === meuEmpreendimentoId)

  useEffect(() => {
    if (!meuEmpreendimentoId) return
    getMetricasEmpresa(meuEmpreendimentoId).then((m) => {
      setMetricas(m)
      setCarregando(false)
    })
  }, [meuEmpreendimentoId])

  if (loading) return <div className="container-page py-20 text-center text-forest-500">Carregando…</div>
  if (!user) return <Navigate to="/entrar" replace />

  const graficoDados = metricas
    ? mergeSeriesPorDia(metricas.curtidasSerie, metricas.viewsSerie)
    : []

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="flex items-start justify-between">
        <SectionTitle
          eyebrow="Meu painel"
          title="Métricas do empreendimento"
          desc="Acompanhe curtidas e visualizações da sua página na vitrine."
        />
        <button
          onClick={async () => { await signOut(); navigate('/entrar') }}
          className="btn-ghost mt-1 text-sm"
        >
          Sair
        </button>
      </div>

      {!meuEmpreendimentoId && (
        <div className="card mt-10 p-8 text-center">
          <p className="text-forest-600">Sua conta ainda não está vinculada a um empreendimento.</p>
          <Link to="/cadastro" className="btn-primary mt-4">
            Cadastrar empreendimento
          </Link>
        </div>
      )}

      {meuEmpreendimentoId && (
        <>
          {/* Cabeçalho do empreendimento */}
          {meuEmpreendimento && (
            <div className="mt-8 flex items-center gap-4">
              <div
                className="h-12 w-12 rounded-xl"
                style={{ background: `linear-gradient(135deg, ${meuEmpreendimento.cor}, #0a2015)` }}
              />
              <div>
                <p className="font-display font-700 text-forest-800">{meuEmpreendimento.nome}</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-forest-500">{meuEmpreendimento.categoria}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-600 ${
                    meuEmpreendimento.aprovado
                      ? 'bg-forest-100 text-forest-700'
                      : 'bg-sun-500/20 text-sun-600'
                  }`}>
                    {meuEmpreendimento.aprovado ? '✓ Publicado' : '⏳ Aguardando aprovação'}
                  </span>
                </div>
              </div>
              <Link to={`/vitrine/${meuEmpreendimentoId}`} className="btn-ghost ml-auto text-sm">
                Ver página →
              </Link>
            </div>
          )}

          {/* Cards de totais */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon="❤️"
              label="Curtidas totais"
              value={carregando ? '—' : String(metricas?.curtidasTotal ?? 0)}
              cor="rose"
            />
            <StatCard
              icon="👁️"
              label="Visualizações totais"
              value={carregando ? '—' : String(metricas?.viewsTotal ?? 0)}
              cor="river"
            />
            <StatCard
              icon="❤️"
              label="Curtidas este mês"
              value={carregando ? '—' : String(
                metricas?.curtidasSerie
                  .filter((d) => d.dia >= new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10))
                  .reduce((a, b) => a + b.total, 0) ?? 0
              )}
              cor="rose"
              small
            />
            <StatCard
              icon="👁️"
              label="Views este mês"
              value={carregando ? '—' : String(
                metricas?.viewsSerie
                  .filter((d) => d.dia >= new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10))
                  .reduce((a, b) => a + b.total, 0) ?? 0
              )}
              cor="river"
              small
            />
          </div>

          {/* Gráfico */}
          <div className="card mt-8 p-6">
            <h3 className="font-display font-700 text-forest-800">Evolução nos últimos 30 dias</h3>
            {!isSupabaseConfigured ? (
              <p className="mt-4 text-sm text-forest-400">
                Configure o Supabase para ver dados reais no gráfico.
              </p>
            ) : carregando ? (
              <p className="mt-4 text-sm text-forest-400">Carregando dados…</p>
            ) : graficoDados.length === 0 ? (
              <p className="mt-4 text-sm text-forest-400">
                Ainda sem interações registradas. Compartilhe sua página!
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={280} className="mt-4">
                <LineChart data={graficoDados.map((d) => ({ ...d, dia: fmtDia(d.dia) }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8f0e9" />
                  <XAxis dataKey="dia" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="curtidas" stroke="#e11d48" strokeWidth={2} dot={false} name="Curtidas" />
                  <Line type="monotone" dataKey="views" stroke="#0369a1" strokeWidth={2} dot={false} name="Visualizações" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="mt-6 card p-5 text-sm text-forest-600">
            💡 <strong>Dica:</strong> Compartilhe o link da sua página na vitrine nas redes sociais para aumentar suas visualizações e curtidas — isso dá mais visibilidade ao seu empreendimento.
          </div>
        </>
      )}
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  cor,
  small,
}: {
  icon: string
  label: string
  value: string
  cor: 'rose' | 'river'
  small?: boolean
}) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        <span className="text-xs text-forest-500">{label}</span>
      </div>
      <p className={`mt-2 font-display font-800 ${small ? 'text-2xl' : 'text-3xl'} ${
        cor === 'rose' ? 'text-rose-600' : 'text-river-600'
      }`}>
        {value}
      </p>
    </div>
  )
}
