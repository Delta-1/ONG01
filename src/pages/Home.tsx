import { Link } from 'react-router-dom'
import OrganicBg from '../components/OrganicBg'
import { SectionTitle } from '../components/ui'
import { totaisEstaduais, MUNICIPIOS } from '../data/municipios'
import { EMPREENDIMENTOS, NOTICIAS } from '../data/conteudo'
import { fmtInt, fmtReaisMil, fmtData } from '../lib/format'

export default function Home() {
  const t = totaisEstaduais()
  const destaques = EMPREENDIMENTOS.filter((e) => e.destaque)

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-forest-900 text-white">
        <OrganicBg />
        <div className="container-page relative grid gap-10 py-20 sm:py-28 lg:grid-cols-2 lg:items-center">
          <div className="animate-fade-up">
            <span className="chip !bg-forest-800 !text-forest-100">
              🌿 Sociobiodiversidade · Bioeconomia · Acre
            </span>
            <h1 className="mt-5 font-display text-4xl font-800 leading-tight sm:text-5xl">
              O valor da floresta em pé, <span className="text-forest-300">em dados e histórias</span>.
            </h1>
            <p className="mt-5 max-w-xl text-forest-100/90">
              O Observatório Acriano da Sócio-bioeconomia reúne, em um só lugar, os dados dos
              empreendimentos da floresta, a legislação de proteção e uma vitrine viva dos produtos
              da sociobiodiversidade do Acre.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/observatorio" className="btn bg-white text-forest-800 hover:bg-forest-50">
                Explorar o dashboard
              </Link>
              <Link to="/vitrine" className="btn border border-forest-500 text-white hover:bg-forest-800">
                Ver a vitrine
              </Link>
            </div>
          </div>

          <div className="animate-fade-up grid grid-cols-2 gap-4" style={{ animationDelay: '0.15s' }}>
            {[
              { v: fmtInt(t.empreendimentos), l: 'empreendimentos mapeados' },
              { v: '22', l: 'municípios monitorados' },
              { v: fmtInt(t.familias), l: 'famílias envolvidas' },
              { v: fmtReaisMil(t.faturamentoMil), l: 'movimentados por ano' },
            ].map((s) => (
              <div key={s.l} className="rounded-2xl border border-forest-700/60 bg-forest-800/50 p-5 backdrop-blur">
                <p className="font-display text-3xl font-800 text-forest-200">{s.v}</p>
                <p className="mt-1 text-sm text-forest-100/80">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="h-6 bg-gradient-to-b from-transparent to-forest-50" />
      </section>

      {/* Frentes do portal */}
      <section className="container-page py-16">
        <SectionTitle
          center
          eyebrow="O que é o Observatório"
          title="Um portal, três frentes que conversam"
          desc="Conteúdo institucional, um dashboard público de dados e uma vitrine de empreendimentos — tudo com a cara da floresta."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            {
              to: '/observatorio',
              titulo: 'Dashboard de dados',
              desc: 'Mapa interativo do Acre com indicadores por município. Passe o mouse e clique para explorar.',
              cta: 'Abrir dashboard',
              emoji: '🗺️',
            },
            {
              to: '/vitrine',
              titulo: 'Vitrine de empreendimentos',
              desc: 'Conheça a história, os produtos e o contato dos negócios da sociobiodiversidade.',
              cta: 'Ver empreendimentos',
              emoji: '🛍️',
            },
            {
              to: '/legislacao',
              titulo: 'Legislação & notícias',
              desc: 'Leis, princípios de defesa da sociobiodiversidade e as atualizações do Observatório.',
              cta: 'Explorar conteúdo',
              emoji: '📜',
            },
          ].map((c) => (
            <Link
              key={c.to}
              to={c.to}
              className="card group p-6 transition hover:-translate-y-1 hover:shadow-md"
            >
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-forest-100 text-2xl">
                {c.emoji}
              </span>
              <h3 className="mt-4 font-display text-lg font-700 text-forest-800">{c.titulo}</h3>
              <p className="mt-2 text-sm text-forest-600">{c.desc}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-600 text-forest-600 group-hover:gap-2 group-hover:text-forest-800">
                {c.cta} →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Destaques da vitrine */}
      <section className="bg-forest-100/50 py-16">
        <div className="container-page">
          <div className="flex items-end justify-between gap-4">
            <SectionTitle eyebrow="Vitrine" title="Empreendimentos em destaque" />
            <Link to="/vitrine" className="hidden shrink-0 text-sm font-600 text-forest-600 hover:text-forest-800 sm:block">
              ver todos →
            </Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {destaques.map((e) => {
              const mun = MUNICIPIOS.find((m) => m.codigo === e.municipioCodigo)
              return (
                <Link key={e.id} to={`/vitrine/${e.id}`} className="card group overflow-hidden transition hover:shadow-md">
                  <div className="h-32 w-full" style={{ background: `linear-gradient(135deg, ${e.cor}, #0a2015)` }} />
                  <div className="p-5">
                    <span className="chip">{e.categoria}</span>
                    <h3 className="mt-2 font-display font-700 text-forest-800 group-hover:text-forest-900">
                      {e.nome}
                    </h3>
                    <p className="mt-1 text-xs text-forest-500">{mun?.nome} · {mun?.regiao}</p>
                    <p className="mt-2 line-clamp-2 text-sm text-forest-600">{e.historia}</p>
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
          <Link to="/noticias" className="hidden shrink-0 text-sm font-600 text-forest-600 hover:text-forest-800 sm:block">
            todas as notícias →
          </Link>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {NOTICIAS.map((n) => (
            <article key={n.id} className="card p-5">
              <span className="text-xs font-600 uppercase tracking-wide text-river-600">{n.categoria}</span>
              <h3 className="mt-2 font-display font-700 leading-snug text-forest-800">{n.titulo}</h3>
              <p className="mt-2 text-sm text-forest-600">{n.resumo}</p>
              <p className="mt-3 text-xs text-forest-400">{fmtData(n.data)}</p>
            </article>
          ))}
        </div>
      </section>

      {/* CTA cadastro */}
      <section className="container-page pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-forest-800 px-8 py-14 text-center text-white">
          <OrganicBg />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="font-display text-3xl font-800">É um empreendedor da floresta?</h2>
            <p className="mt-3 text-forest-100/90">
              Cadastre seu negócio, conte sua história e apareça na vitrine do Observatório. O
              cadastro é gratuito e passa por uma curadoria simples da nossa equipe.
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
