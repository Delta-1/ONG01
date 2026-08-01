import { Link } from 'react-router-dom'
import OrganicBg from '../components/OrganicBg'
import AcreMapHero from '../components/AcreMapHero'
import { SectionTitle } from '../components/ui'
import { LeafMark, FloatingLeaf } from '../components/Leaf'
import { useMunicipios, useEmpreendimentos, useNoticias } from '../hooks/useData'
import { fmtInt, fmtReaisMil, fmtData } from '../lib/format'

export default function Home() {
  const { municipios, totais: t } = useMunicipios()
  const empreendimentos = useEmpreendimentos()
  const noticias = useNoticias()
  const destaques = empreendimentos.filter((e) => e.destaque).slice(0, 3)

  return (
    <div>
      {/* HERO editorial + mapa */}
      <section className="relative overflow-hidden bg-forest-950 text-white">
        <OrganicBg />
        <div className="container-page relative grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-2">
          <div className="animate-fade-up">
            <p className="eyebrow !text-forest-300">Observatório · Acre · Amazônia</p>
            <h1 className="mt-4 font-display text-4xl font-700 leading-[1.1] sm:text-5xl">
              O valor da floresta em pé,
              <span className="block text-forest-300">em dados e histórias.</span>
            </h1>
            <div className="mt-5 h-px w-16 bg-sun-500" />
            <p className="mt-5 max-w-xl leading-relaxed text-forest-100/90">
              Um centro público de referência sobre a sócio-bioeconomia acriana: reúne os dados dos
              empreendimentos da floresta, a legislação de proteção e uma vitrine viva dos produtos da
              sociobiodiversidade do Acre.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/observatorio" className="btn bg-white text-forest-900 hover:bg-forest-50">
                Explorar o dashboard
              </Link>
              <Link to="/vitrine" className="btn border border-forest-500 text-white hover:bg-forest-900">
                Ver a vitrine
              </Link>
            </div>
          </div>

          {/* Mapa interativo do Acre na tela inicial */}
          <div className="animate-fade-up rounded-lg bg-forest-900/40 p-6 backdrop-blur" style={{ animationDelay: '0.15s' }}>
            <AcreMapHero />
          </div>
        </div>
      </section>

      {/* Faixa de indicadores (estilo institucional) */}
      <section className="border-b border-forest-100 bg-white">
        <div className="container-page grid grid-cols-2 divide-forest-100 py-10 sm:grid-cols-4 sm:divide-x">
          {[
            { v: fmtInt(t.empreendimentos), l: 'empreendimentos mapeados' },
            { v: '22', l: 'municípios monitorados' },
            { v: fmtInt(t.familias), l: 'famílias envolvidas' },
            { v: fmtReaisMil(t.faturamentoMil), l: 'movimentados por ano' },
          ].map((s) => (
            <div key={s.l} className="px-4 py-2 text-center">
              <p className="font-display text-3xl font-700 text-forest-800">{s.v}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-forest-500">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Frentes do portal */}
      <section className="container-page py-16">
        <SectionTitle
          center
          eyebrow="O que é o Observatório"
          title="Um portal, três frentes que conversam"
          desc="Conteúdo institucional, um dashboard público de dados e uma vitrine de empreendimentos — tudo com a cara da floresta."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            {
              to: '/observatorio',
              titulo: 'Dashboard de dados',
              desc: 'Mapa interativo do Acre com indicadores por município. Passe o mouse e clique para explorar.',
              cta: 'Abrir dashboard',
            },
            {
              to: '/vitrine',
              titulo: 'Vitrine de empreendimentos',
              desc: 'Conheça a história, os produtos e o contato dos negócios da sociobiodiversidade.',
              cta: 'Ver empreendimentos',
            },
            {
              to: '/legislacao',
              titulo: 'Legislação & notícias',
              desc: 'Leis, princípios de defesa da sociobiodiversidade e as atualizações do Observatório.',
              cta: 'Explorar conteúdo',
            },
          ].map((c) => (
            <Link key={c.to} to={c.to} className="card group relative overflow-hidden p-6 transition hover:-translate-y-1 hover:shadow-md">
              <LeafMark className="h-9 w-9 text-forest-500" />
              <h3 className="mt-4 font-display text-xl font-700 text-ink">{c.titulo}</h3>
              <p className="mt-2 text-sm leading-relaxed text-forest-700">{c.desc}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-600 text-forest-700 group-hover:gap-2">
                {c.cta} →
              </span>
              <FloatingLeaf className="absolute -bottom-4 -right-4 h-16 w-16 text-forest-50" />
            </Link>
          ))}
        </div>
      </section>

      {/* Destaques da vitrine */}
      <section className="bg-forest-50 py-16">
        <div className="container-page">
          <div className="flex items-end justify-between gap-4">
            <SectionTitle eyebrow="Vitrine" title="Empreendimentos em destaque" />
            <Link to="/vitrine" className="hidden shrink-0 text-sm font-600 text-forest-700 link-underline sm:block">
              ver todos →
            </Link>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {destaques.map((e) => {
              const mun = municipios.find((m) => m.codigo === e.municipioCodigo)
              return (
                <Link key={e.id} to={`/vitrine/${e.id}`} className="card group overflow-hidden transition hover:shadow-md">
                  <div className="relative h-32 w-full" style={{ background: `linear-gradient(135deg, ${e.cor}, #0a2015)` }}>
                    <LeafMark className="absolute right-3 top-3 h-6 w-6 text-white/50" />
                  </div>
                  <div className="p-5">
                    <span className="chip">{e.categoria}</span>
                    <h3 className="mt-2 font-display text-lg font-700 text-ink group-hover:text-forest-800">{e.nome}</h3>
                    <p className="mt-1 text-xs text-forest-500">{mun?.nome} · {mun?.regiao}</p>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-forest-700">{e.historia}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Notícias */}
      <section className="container-page py-16">
        <div className="flex items-end justify-between gap-4">
          <SectionTitle eyebrow="Portal" title="Últimas do Observatório" />
          <Link to="/noticias" className="hidden shrink-0 text-sm font-600 text-forest-700 link-underline sm:block">
            todas as notícias →
          </Link>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {noticias.map((n) => (
            <article key={n.id} className="border-t-2 border-forest-200 pt-4">
              <span className="eyebrow !text-river-700">{n.categoria}</span>
              <h3 className="mt-2 font-display text-lg font-700 leading-snug text-ink">{n.titulo}</h3>
              <p className="mt-2 text-sm leading-relaxed text-forest-700">{n.resumo}</p>
              <p className="mt-3 text-xs text-forest-400">{fmtData(n.data)}</p>
            </article>
          ))}
        </div>
      </section>

      {/* CTA cadastro */}
      <section className="container-page pb-20">
        <div className="relative overflow-hidden rounded-lg bg-forest-900 px-8 py-14 text-center text-white">
          <OrganicBg />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="font-display text-3xl font-700">É um empreendedor da floresta?</h2>
            <div className="mx-auto mt-4 h-px w-16 bg-sun-500" />
            <p className="mt-4 leading-relaxed text-forest-100/90">
              Cadastre seu negócio, conte sua história e apareça na vitrine do Observatório. O cadastro
              é gratuito e passa por uma curadoria simples da nossa equipe.
            </p>
            <Link to="/cadastro" className="btn mt-7 bg-sun-500 text-forest-950 hover:bg-sun-400">
              Cadastrar meu empreendimento
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
