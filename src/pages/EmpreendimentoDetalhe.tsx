import { Link, useParams } from 'react-router-dom'
import { EMPREENDIMENTOS } from '../data/conteudo'
import { MUNICIPIOS_POR_CODIGO } from '../data/municipios'

export default function EmpreendimentoDetalhe() {
  const { id } = useParams()
  const e = EMPREENDIMENTOS.find((x) => x.id === id)

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

  const mun = MUNICIPIOS_POR_CODIGO[e.municipioCodigo]

  return (
    <div>
      <div className="relative h-56 sm:h-72" style={{ background: `linear-gradient(135deg, ${e.cor}, #0a2015)` }}>
        <div className="container-page relative flex h-full flex-col justify-end pb-6">
          <Link to="/vitrine" className="absolute top-6 text-sm text-white/80 hover:text-white">
            ← Voltar à vitrine
          </Link>
          <span className="chip w-fit !bg-white/90 !text-forest-700">{e.categoria}</span>
          <h1 className="mt-2 font-display text-3xl font-800 text-white sm:text-4xl">{e.nome}</h1>
          <p className="mt-1 text-white/85">{mun?.nome} · {mun?.regiao}</p>
        </div>
      </div>

      <div className="container-page grid gap-8 py-12 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="font-display text-xl font-700 text-forest-800">Conheça nossa história</h2>
          <p className="mt-3 leading-relaxed text-forest-600">{e.historia}</p>

          <h2 className="mt-8 font-display text-xl font-700 text-forest-800">Catálogo de produtos</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {e.produtos.map((p) => (
              <div key={p} className="card overflow-hidden">
                <div className="h-24" style={{ background: `linear-gradient(135deg, ${e.cor}22, ${e.cor}66)` }} />
                <p className="p-3 text-sm font-600 text-forest-700">{p}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {['👍 Curtir', '🔗 Compartilhar', '🖨️ Imprimir'].map((b) => (
              <button key={b} className="btn-ghost">
                {b}
              </button>
            ))}
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
            <Link to="/observatorio" className="btn-primary mt-5 w-full">
              Ver dados do município
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
