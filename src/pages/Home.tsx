import { Link } from "react-router-dom";
import AcreMapHero from "../components/AcreMapHero";
import { SectionTitle } from "../components/ui";
import { BrandArt, BrandRibbon } from "../components/BrandArt";
import {
  useMunicipios,
  useEmpreendimentos,
  useNoticias,
} from "../hooks/useData";
import { fmtInt, fmtData } from "../lib/format";

export default function Home() {
  const { municipios, totais } = useMunicipios();
  const empreendimentos = useEmpreendimentos();
  const noticias = useNoticias();
  const destaques = [...empreendimentos]
    .sort((a, b) => Number(b.destaque) - Number(a.destaque))
    .slice(0, 3);

  return (
    <div className="brand-home">
      <section className="brand-hero">
        <div className="container-page grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-2 lg:gap-14 lg:py-20">
          <div className="relative z-10 animate-fade-up">
            <p className="eyebrow flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-brand-orange" /> Acre ·
              Amazônia · Sociobiodiversidade
            </p>
            <h1 className="brand-hero-title">
              O valor da
              <br />
              floresta em pé,
              <br />
              <span>
                em dados
                <br className="hidden xl:block" /> e histórias.
              </span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-forest-700 sm:text-lg">
              Um olhar para quem vive, produz e mantém a floresta viva. Conheça
              os empreendimentos da sociobiodiversidade e explore os dados do
              Acre.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/observatorio" className="btn-primary">
                Explorar o dashboard <span aria-hidden="true">↗</span>
              </Link>
              <Link to="/vitrine" className="btn-ghost">
                Conhecer a vitrine <span aria-hidden="true">→</span>
              </Link>
            </div>
            <p className="mt-6 text-xs font-medium text-forest-600">
              Territórios, pessoas e saberes que se conectam.
            </p>
          </div>
          <div className="brand-territory animate-fade-up">
            <BrandArt motif="rio" className="brand-hero-river" />
            <BrandArt motif="castanha" className="brand-hero-nut" />
            <BrandArt motif="fruto" className="brand-hero-fruit" />
            <div className="brand-territory-heading">
              <span>UM OLHAR PARA O ACRE</span>
              <BrandArt motif="olhos" className="w-28" />
            </div>
            <div className="brand-map">
              <AcreMapHero />
            </div>
            <div className="brand-territory-bottom">
              <span>
                22 municípios.
                <br />
                Muitas histórias.
              </span>
              <BrandArt motif="semente-oliva" className="h-16 w-16" />
            </div>
          </div>
        </div>
        <BrandRibbon />
      </section>

      <section className="brand-stats" aria-label="Retrato do mapeamento">
        <div className="container-page grid grid-cols-2 gap-y-6 py-9 sm:grid-cols-4">
          {[
            {
              v: fmtInt(totais.empreendimentos),
              l: "empreendimentos mapeados",
            },
            { v: "22", l: "municípios no mapa" },
            {
              v: String(new Set(empreendimentos.map((e) => e.categoria)).size),
              l: "cadeias representadas",
            },
            {
              v: String(
                new Set(empreendimentos.map((e) => e.municipioCodigo)).size,
              ),
              l: "municípios com cadastros",
            },
          ].map((s) => (
            <div key={s.l} className="brand-stat">
              <p>{s.v}</p>
              <span>{s.l}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page py-16 sm:py-20">
        <div className="flex items-end justify-between gap-6">
          <SectionTitle
            eyebrow="O Observatório"
            title="Conhecer. Valorizar. Conectar."
            desc="Três caminhos para aproximar os dados do território e as histórias de quem faz a floresta acontecer."
          />
          <BrandArt
            motif="semente-verde"
            className="hidden h-24 w-24 rotate-12 sm:block"
          />
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            {
              to: "/observatorio",
              n: "01",
              motif: "semente-oliva" as const,
              title: "O território em dados",
              desc: "Explore o mapa do Acre, a distribuição dos parceiros e os indicadores por município.",
              cta: "Explorar o dashboard",
              tone: "olive",
            },
            {
              to: "/vitrine",
              n: "02",
              motif: "fruto" as const,
              title: "Quem faz a floresta viver",
              desc: "Conheça os negócios, os produtos, os serviços e as histórias da sociobiodiversidade.",
              cta: "Conhecer a vitrine",
              tone: "orange",
            },
            {
              to: "/legislacao",
              n: "03",
              motif: "castanha" as const,
              title: "Saberes que fortalecem",
              desc: "Acesse a legislação e os princípios de defesa da floresta, dos povos e da bioeconomia.",
              cta: "Consultar a legislação",
              tone: "clay",
            },
          ].map((c) => (
            <Link
              key={c.to}
              to={c.to}
              className={`brand-path brand-path-${c.tone} group`}
            >
              <div className="flex items-start justify-between">
                <span className="brand-path-number">{c.n}</span>
                <BrandArt
                  motif={c.motif}
                  className="h-20 w-20 transition-transform duration-300 group-hover:-rotate-12"
                />
              </div>
              <h3 className="mt-8 font-display text-2xl font-bold leading-tight text-forest-900">
                {c.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-forest-700">
                {c.desc}
              </p>
              <span className="mt-6 flex items-center justify-between text-sm font-semibold text-forest-800">
                {c.cta}
                <span aria-hidden="true">↗</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="brand-showcase py-16 sm:py-20">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <SectionTitle
              eyebrow="Vitrine da floresta"
              title="Histórias que merecem ser vistas."
            />
            <Link to="/vitrine" className="brand-text-link">
              Ver a vitrine <span aria-hidden="true">→</span>
            </Link>
          </div>
          {destaques.length === 0 ? (
            <div className="brand-empty mt-8">
              <div className="brand-empty-art">
                <BrandArt motif="fruto" className="h-24 w-24" />
                <BrandArt motif="semente-verde" className="h-20 w-20" />
              </div>
              <div className="max-w-lg">
                <p className="eyebrow">A vitrine está começando</p>
                <h3 className="mt-2 font-display text-2xl font-bold text-forest-900">
                  O próximo capítulo pode ser o seu.
                </h3>
                <p className="mt-3 leading-relaxed text-forest-700">
                  Tem um produto ou serviço ligado à sociobiodiversidade do
                  Acre? Envie seu cadastro. Os perfis aparecem aqui depois da
                  aprovação da equipe.
                </p>
                <Link to="/formulario/vitrine" className="btn-primary mt-5">
                  Cadastrar na vitrine <span aria-hidden="true">↗</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {destaques.map((e) => {
                const mun = municipios.find(
                  (m) => m.codigo === e.municipioCodigo,
                );
                return (
                  <Link
                    key={e.id}
                    to={`/vitrine/${e.id}`}
                    className="card group overflow-hidden transition hover:-translate-y-1"
                  >
                    <div className="relative flex h-36 items-center justify-center overflow-hidden bg-brand-green">
                      <BrandArt
                        motif="semente-oliva"
                        className="h-28 w-28 rotate-12"
                      />
                      <BrandArt
                        motif="rio"
                        className="absolute -bottom-4 left-0 w-full opacity-70"
                      />
                    </div>
                    <div className="p-6">
                      <span className="chip">{e.categoria}</span>
                      <h3 className="mt-3 font-display text-xl font-bold text-forest-900">
                        {e.nome}
                      </h3>
                      <p className="mt-1 text-xs text-forest-600">
                        {mun?.nome} · {mun?.regiao}
                      </p>
                      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-forest-700">
                        {e.historia}
                      </p>
                      <span className="brand-text-link mt-5 inline-block">
                        Conhecer a história →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="container-page py-16 sm:py-20">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <SectionTitle
            eyebrow="Fique por dentro"
            title="O que acontece por aqui."
          />
          <Link to="/noticias" className="brand-text-link">
            Todas as notícias →
          </Link>
        </div>
        {noticias.length === 0 ? (
          <div className="brand-news-empty mt-8">
            <BrandArt motif="olhos" className="w-36 shrink-0" />
            <div>
              <h3 className="font-display text-xl font-semibold text-forest-900">
                Um olhar atento à floresta.
              </h3>
              <p className="mt-2 text-sm text-forest-700">
                As notícias oficiais do Observatório serão publicadas aqui.
                Enquanto isso, conheça o projeto e as formas de participar.
              </p>
              <Link to="/sobre" className="brand-text-link mt-4 inline-block">
                Conheça o Observatório →
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {noticias.slice(0, 4).map((n) => (
              <article
                key={n.id}
                className="border-t-4 border-brand-orange pt-5"
              >
                <span className="eyebrow !text-brand-red">{n.categoria}</span>
                <h3 className="mt-3 font-display text-xl font-bold leading-snug text-forest-900">
                  {n.titulo}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-forest-700">
                  {n.resumo}
                </p>
                <p className="mt-4 text-xs text-forest-600">
                  {fmtData(n.data)}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="container-page pb-8">
        <div className="brand-participate">
          <BrandArt motif="rio" className="brand-participate-river" />
          <div className="relative z-10">
            <p className="eyebrow !text-brand-yellow">Faça parte dessa rede</p>
            <h2 className="mt-4 max-w-xl font-display text-3xl font-bold leading-tight sm:text-4xl">
              A floresta ganha força
              <br />
              quando a gente se conecta.
            </h2>
            <p className="mt-5 max-w-xl leading-relaxed text-white/90">
              Você pode divulgar seus produtos e serviços na vitrine ou
              contribuir com o mapeamento do Observatório. Todo cadastro passa
              pela análise da equipe.
            </p>
          </div>
          <div className="relative z-10 grid gap-3 self-center">
            <Link
              to="/formulario/vitrine"
              className="btn bg-brand-yellow text-forest-950 hover:bg-paper"
            >
              Tenho produtos ou serviços <span aria-hidden="true">↗</span>
            </Link>
            <Link
              to="/formulario/dashboard"
              className="btn border border-white/60 text-white hover:bg-white/10"
            >
              Quero contribuir com dados <span aria-hidden="true">↗</span>
            </Link>
            <p className="text-center text-xs text-white/80">
              Cadastro gratuito · Não precisa criar conta
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
