import { useEffect, useRef, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { getMetricasAdmin } from '../lib/metricas'
import { TEMAS, aplicarTema, temaEmCache, carregarTemaGlobal, salvarTemaGlobal } from '../lib/temas'
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

      {/* Convite: link compartilhável de cadastro */}
      <ConviteEmpreendedores />

      {/* Configurações do site: tema global */}
      <ConfiguracoesSite />

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

/**
 * Card de convite: mostra o link público de cadastro para o admin compartilhar
 * com empreendedores. Eles abrem o link, criam a conta, confirmam o e-mail e
 * publicam seu empreendimento — alimentando a plataforma.
 */
function ConviteEmpreendedores() {
  const [copiado, setCopiado] = useState(false)
  const link = `${window.location.origin}/cadastro`
  const mensagem =
    `Olá! 🌱 Cadastre seu empreendimento no Observatório Acriano da Sócio-bioeconomia ` +
    `e ganhe uma página gratuita na nossa vitrine. É rápido: ${link}`

  async function copiar() {
    try {
      await navigator.clipboard.writeText(link)
    } catch {
      // Fallback para navegadores/contextos sem clipboard API
      const el = document.createElement('textarea')
      el.value = link
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-forest-200 bg-gradient-to-br from-forest-800 to-forest-950 p-6 text-white sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-600 tracking-wide">
            🔗 Link de convite
          </span>
          <h3 className="mt-3 font-display text-xl font-700">Convide empreendedores</h3>
          <p className="mt-1.5 text-sm text-forest-100/80">
            Compartilhe o link abaixo. Quem receber cria a conta, confirma o e-mail e publica o
            próprio empreendimento — direto, sem você precisar cadastrar por eles.
          </p>
        </div>

        <div className="w-full lg:max-w-md">
          <div className="flex items-center gap-2 rounded-lg bg-white/10 p-1.5 ring-1 ring-white/15">
            <input
              readOnly
              value={link}
              onFocus={(e) => e.currentTarget.select()}
              className="w-full flex-1 truncate bg-transparent px-3 py-2 text-sm text-white/90 outline-none"
            />
            <button
              onClick={copiar}
              className="shrink-0 rounded-md bg-white px-4 py-2 text-sm font-700 text-forest-800 transition hover:bg-forest-50"
            >
              {copiado ? '✓ Copiado!' : 'Copiar'}
            </button>
          </div>
          <div className="mt-3 flex gap-2">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(mensagem)}`}
              target="_blank"
              rel="noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-md bg-white/10 px-4 py-2 text-sm font-600 text-white ring-1 ring-white/15 transition hover:bg-white/20"
            >
              💬 WhatsApp
            </a>
            <a
              href={`mailto:?subject=${encodeURIComponent('Cadastre seu empreendimento — Observatório Acriano')}&body=${encodeURIComponent(mensagem)}`}
              className="flex flex-1 items-center justify-center gap-2 rounded-md bg-white/10 px-4 py-2 text-sm font-600 text-white ring-1 ring-white/15 transition hover:bg-white/20"
            >
              ✉️ E-mail
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Painel de configurações do site: o admin escolhe o tema (aparência) e aplica
 * para todos os usuários. A escolha é salva no Supabase (site_config) e carregada
 * no início de cada visita.
 */
function ConfiguracoesSite() {
  const [selecionado, setSelecionado] = useState<string>(temaEmCache())
  const [salvo, setSalvo] = useState<string>(temaEmCache())
  const [salvando, setSalvando] = useState(false)
  const [msg, setMsg] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null)
  const salvoRef = useRef(salvo)

  useEffect(() => {
    carregarTemaGlobal().then((t) => {
      setSalvo(t)
      setSelecionado(t)
      salvoRef.current = t
    })
    // Ao sair da tela sem salvar, restaura o tema global (desfaz o preview).
    return () => aplicarTema(salvoRef.current)
  }, [])

  function preview(id: string) {
    setSelecionado(id)
    aplicarTema(id)
    setMsg(null)
  }

  async function aplicarParaTodos() {
    setSalvando(true)
    setMsg(null)
    const { error } = await salvarTemaGlobal(selecionado)
    setSalvando(false)
    if (error) {
      setMsg({ tipo: 'erro', texto: 'Não foi possível salvar: ' + error })
      return
    }
    setSalvo(selecionado)
    salvoRef.current = selecionado
    setMsg({ tipo: 'ok', texto: 'Tema aplicado para todos os usuários! 🎉' })
  }

  const mudou = selecionado !== salvo

  return (
    <div className="card mt-6 p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="eyebrow">Configurações do site</span>
          <h3 className="mt-1 font-display text-xl font-700 text-forest-800">Aparência e tema</h3>
          <p className="mt-1 text-sm text-forest-500">
            Escolha o estilo de cores. Ao aplicar, o tema vale para todos os visitantes do site.
          </p>
        </div>
        <button
          onClick={aplicarParaTodos}
          disabled={!mudou || salvando}
          className="btn-primary text-sm disabled:cursor-not-allowed disabled:opacity-50"
        >
          {salvando ? 'Aplicando…' : mudou ? 'Aplicar para todos' : 'Tema aplicado'}
        </button>
      </div>

      {msg && (
        <p
          className={`mt-4 rounded-lg px-4 py-2.5 text-sm ${
            msg.tipo === 'ok' ? 'bg-forest-50 text-forest-700' : 'bg-red-50 text-red-600'
          }`}
        >
          {msg.texto}
        </p>
      )}

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {TEMAS.map((t) => {
          const ativo = selecionado === t.id
          return (
            <button
              key={t.id}
              onClick={() => preview(t.id)}
              className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                ativo
                  ? 'border-forest-500 bg-forest-50 ring-2 ring-forest-200'
                  : 'border-forest-100 hover:border-forest-300 hover:bg-forest-50/50'
              }`}
            >
              {/* Amostra de cores */}
              <div className="flex shrink-0 -space-x-1.5">
                {t.swatch.map((cor, i) => (
                  <span
                    key={i}
                    className="h-7 w-7 rounded-full border-2 border-white shadow-sm"
                    style={{ background: cor }}
                  />
                ))}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="font-600 text-forest-800">{t.nome}</p>
                  {salvo === t.id && (
                    <span className="rounded-full bg-forest-600 px-1.5 py-0.5 text-[10px] font-700 text-white">
                      ATIVO
                    </span>
                  )}
                </div>
                <p className="truncate text-xs text-forest-500">{t.descricao}</p>
              </div>
              {ativo && <span className="shrink-0 text-forest-600">✓</span>}
            </button>
          )
        })}
      </div>

      {mudou && (
        <p className="mt-4 text-xs text-forest-400">
          👀 Você está pré-visualizando <span className="font-600">{TEMAS.find((t) => t.id === selecionado)?.nome}</span>.
          Clique em <span className="font-600">“Aplicar para todos”</span> para salvar, ou saia da página para descartar.
        </p>
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
