import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useEmpreendimentos, useMunicipios } from '../hooks/useData'
import { useAuth } from '../contexts/AuthContext'
import {
  getCurtidasCount,
  checkarCurtida,
  toggleCurtida,
  registrarView,
} from '../lib/metricas'

export default function EmpreendimentoDetalhe() {
  const { id } = useParams()
  const empreendimentos = useEmpreendimentos()
  const { byCode } = useMunicipios()
  const { user } = useAuth()

  const e = empreendimentos.find((x) => x.id === id)

  const [curtidas, setCurtidas] = useState(0)
  const [curtido, setCurtido] = useState(false)
  const [curtindoAnim, setCurtindoAnim] = useState(false)
  const [compartilhado, setCompartilhado] = useState(false)

  useEffect(() => {
    if (!e) return
    registrarView(e.id)
    getCurtidasCount(e.id).then(setCurtidas)
    checkarCurtida(e.id, user?.id ?? null).then(setCurtido)
  }, [e?.id, user?.id])

  async function handleCurtir() {
    if (!e) return
    setCurtindoAnim(true)
    setTimeout(() => setCurtindoAnim(false), 600)
    const novoEstado = !curtido
    setCurtido(novoEstado)
    setCurtidas((n) => (novoEstado ? n + 1 : Math.max(0, n - 1)))
    await toggleCurtida(e.id, user?.id ?? null, curtido)
  }

  async function handleCompartilhar() {
    const url = window.location.href
    if (navigator.share) {
      await navigator.share({ title: e?.nome ?? '', url })
    } else {
      await navigator.clipboard.writeText(url)
      setCompartilhado(true)
      setTimeout(() => setCompartilhado(false), 2000)
    }
  }

  function handleImprimir() {
    window.print()
  }

  if (!e) {
    return (
      <div className="container-page py-20 text-center">
        <p className="text-forest-600">Empreendimento não encontrado.</p>
        <Link to="/vitrine" className="btn-primary mt-4">
          Voltar à vitrine
        </Link>
      </div>
    )
  }

  const mun = byCode[e.municipioCodigo]

  return (
    <div className="print:p-8">
      <div
        className="relative h-56 sm:h-72 print:hidden"
        style={{ background: `linear-gradient(135deg, ${e.cor}, #0a2015)` }}
      >
        <div className="container-page relative flex h-full flex-col justify-end pb-6">
          <Link to="/vitrine" className="absolute top-6 text-sm text-white/80 hover:text-white print:hidden">
            ← Voltar à vitrine
          </Link>
          <span className="chip w-fit !bg-white/90 !text-forest-700">{e.categoria}</span>
          <h1 className="mt-2 font-display text-3xl font-800 text-white sm:text-4xl">{e.nome}</h1>
          <p className="mt-1 text-white/85">{mun?.nome} · {mun?.regiao}</p>
        </div>
      </div>

      {/* Cabeçalho para impressão */}
      <div className="hidden print:block">
        <h1 className="font-display text-3xl font-800 text-forest-800">{e.nome}</h1>
        <p className="mt-1 text-forest-600">{e.categoria} · {mun?.nome} · {mun?.regiao}</p>
        <hr className="my-4" />
      </div>

      <div className="container-page grid gap-8 py-12 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="font-display text-xl font-700 text-forest-800">Conheça nossa história</h2>
          <p className="mt-3 leading-relaxed text-forest-600">{e.historia}</p>

          <h2 className="mt-8 font-display text-xl font-700 text-forest-800">Catálogo de produtos</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {e.produtos.map((p) => (
              <div key={p} className="card overflow-hidden">
                <div
                  className="h-24 print:hidden"
                  style={{ background: `linear-gradient(135deg, ${e.cor}22, ${e.cor}66)` }}
                />
                <p className="p-3 text-sm font-600 text-forest-700">{p}</p>
              </div>
            ))}
          </div>

          {/* Botões de ação */}
          <div className="mt-8 flex flex-wrap items-center gap-3 print:hidden">
            <button
              onClick={handleCurtir}
              className={`flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-600 transition-all ${
                curtido
                  ? 'border-rose-300 bg-rose-50 text-rose-600 hover:bg-rose-100'
                  : 'border-forest-200 bg-white text-forest-700 hover:border-forest-400'
              } ${curtindoAnim ? 'scale-110' : 'scale-100'}`}
            >
              <span className={`text-base transition-transform ${curtindoAnim ? 'scale-125' : ''}`}>
                {curtido ? '❤️' : '🤍'}
              </span>
              {curtido ? 'Curtido' : 'Curtir'}
              {curtidas > 0 && (
                <span className="ml-1 rounded-full bg-forest-100 px-2 py-0.5 text-xs text-forest-600">
                  {curtidas}
                </span>
              )}
            </button>

            <button
              onClick={handleCompartilhar}
              className="flex items-center gap-2 rounded-full border border-forest-200 bg-white px-5 py-2 text-sm font-600 text-forest-700 transition hover:border-forest-400"
            >
              🔗 {compartilhado ? 'Link copiado!' : 'Compartilhar'}
            </button>

            <button
              onClick={handleImprimir}
              className="flex items-center gap-2 rounded-full border border-forest-200 bg-white px-5 py-2 text-sm font-600 text-forest-700 transition hover:border-forest-400"
            >
              🖨️ Imprimir
            </button>
          </div>
        </div>

        <aside className="lg:col-span-1">
          <div className="card p-6">
            <h3 className="font-display font-700 text-forest-800">Contato</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-xs font-medium text-forest-400">Telefone</dt>
                <dd className="text-forest-700">{e.contato.telefone}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-forest-400">E-mail</dt>
                <dd className="text-forest-700">{e.contato.email}</dd>
              </div>
              {e.contato.instagram && (
                <div>
                  <dt className="text-xs font-medium text-forest-400">Instagram</dt>
                  <dd className="text-forest-700">{e.contato.instagram}</dd>
                </div>
              )}
            </dl>
            <Link to="/observatorio" className="btn-primary mt-5 w-full print:hidden">
              Ver dados do município
            </Link>
          </div>

          {curtidas > 0 && (
            <div className="card mt-4 flex items-center gap-3 p-4 print:hidden">
              <span className="text-2xl">❤️</span>
              <div>
                <p className="font-700 text-forest-800">{curtidas} curtida{curtidas !== 1 ? 's' : ''}</p>
                <p className="text-xs text-forest-500">neste empreendimento</p>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
