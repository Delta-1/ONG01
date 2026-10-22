import { useState } from "react";
import { Link } from "react-router-dom";
import AcreMap from "../components/AcreMap";
import { useLoad } from "../hooks/useData";
import { fetchBaseObservatorio } from "../lib/queries";
import { resumoIndicador } from "../lib/parceiros";
import { MUNICIPIOS } from "../data/municipios";
import { METRICA_POR_ID } from "../data/metricas";
import { Message } from "../components/FormUI";

export default function Dashboard() {
  const state = useLoad(fetchBaseObservatorio);
  const [selected, setSelected] = useState(""),
    [year, setYear] = useState("");
  const all = state.data ?? [];
  const rows = all.filter(
    (r) =>
      (!selected || r.municipioCodigo === selected) &&
      (!year || String(r.ano_referencia) === year),
  );
  const geoRows = all.filter((r) => !year || String(r.ano_referencia) === year);
  const byCode = Object.fromEntries(
    MUNICIPIOS.map((m) => [
      m.codigo,
      {
        ...m,
        indicadores: {
          ...m.indicadores,
          empreendimentos: geoRows.filter((r) => r.municipioCodigo === m.codigo)
            .length,
        },
      },
    ]),
  );
  const years = [
    ...new Set(
      all.flatMap((r) => (r.ano_referencia === null ? [] : [r.ano_referencia])),
    ),
  ].sort((a, b) => b - a);
  const number = (n: number) =>
    n.toLocaleString("pt-BR", { maximumFractionDigits: 3 });
  function distribution(key: "tipo" | "categoria" | "produtos") {
    const counts = new Map<string, number>();
    for (const r of rows)
      for (const label of new Set(
        key === "produtos" ? r.produtos : [r[key] || "Não informado"],
      ))
        counts.set(label, (counts.get(label) ?? 0) + 1);
    return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }
  return (
    <div className="container-page py-10">
      <span className="eyebrow">Observatório · Dados aprovados</span>
      <h1 className="mt-3 font-display text-3xl text-forest-900">
        Parceiros e empreendimentos do Acre
      </h1>
      <p className="mt-3 max-w-3xl text-forest-600">
        Distribuição geográfica, tipos de organização e produtos ou serviços.
        Inclui parceiros com vitrine e parceiros que contribuem somente com
        dados e colaboração. A base é um mapeamento em construção.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link className="btn-primary" to="/formulario/dashboard">
          Contribuir com dados e parceria
        </Link>
        <Link className="btn-ghost" to="/formulario/vitrine">
          Cadastrar na vitrine
        </Link>
      </div>
      {state.error && <Message error>{state.error}</Message>}
      {state.loading ? (
        <p className="py-10">Consultando dados validados…</p>
      ) : (
        <>
          <div className="card mt-6 grid gap-4 p-5 sm:grid-cols-2">
            <label className="text-sm font-semibold">
              Município
              <select
                className="mt-2 w-full rounded-lg border border-forest-200 p-3"
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
              >
                <option value="">Todos os municípios</option>
                {MUNICIPIOS.map((m) => (
                  <option key={m.codigo} value={m.codigo}>
                    {m.nome}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold">
              Ano de referência
              <select
                className="mt-2 w-full rounded-lg border border-forest-200 p-3"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              >
                <option value="">Todos os cadastros</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              [rows.length, "Parceiros mapeados"],
              [rows.filter((r) => r.empresaId).length, "Com perfil na vitrine"],
              [
                rows.filter((r) => !r.empresaId).length,
                "Somente dashboard e parceria",
              ],
              [
                new Set(rows.map((r) => r.municipioCodigo)).size,
                "Municípios representados",
              ],
            ].map(([n, label]) => (
              <div className="card p-5" key={label}>
                <strong className="font-display text-3xl">{n}</strong>
                <p className="mt-2 text-sm text-forest-500">{label}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {(
              [
                ["trabalhadores", "Pessoas que trabalham"],
                ["familias", "Famílias envolvidas"],
                ["producao_anual_ton", "Produção anual (t)"],
              ] as const
            ).map(([key, label]) => {
              const summary = resumoIndicador(rows, key);
              return (
                <div className="card p-5" key={key}>
                  <strong className="font-display text-3xl">
                    {year && summary.informados ? number(summary.total) : "—"}
                  </strong>
                  <p className="mt-2 text-sm">{label}</p>
                  <p className="mt-2 text-xs text-forest-500">
                    {year
                      ? `${summary.informados} de ${rows.length} parceiro(s) informaram este número em ${year}.`
                      : "Selecione um ano para consultar as quantidades."}
                  </p>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-forest-500">
            Campos sem resposta não são tratados como zero. As somas usam
            números declarados pelos parceiros e aprovados pela equipe; pessoas
            e famílias podem participar de mais de uma organização.
          </p>
          {!rows.length && (
            <div className="mt-5">
              <Message>
                Nenhum cadastro aprovado para os filtros selecionados.
              </Message>
            </div>
          )}
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="card p-5 lg:col-span-2">
              <h2 className="mb-4 font-display text-xl">
                Distribuição nos 22 municípios
              </h2>
              <AcreMap
                metrica={{
                  ...METRICA_POR_ID.empreendimentos,
                  label: "Parceiros mapeados",
                }}
                selectedCode={selected || null}
                onSelect={(code) => setSelected(code ?? "")}
                byCode={byCode}
              />
            </div>
            <div className="card p-5">
              <h2 className="font-display text-xl">Por região</h2>
              {["Vale do Acre", "Vale do Juruá"].map((regiao) => (
                <p className="mt-5" key={regiao}>
                  {regiao}:{" "}
                  <strong>
                    {
                      rows.filter(
                        (r) =>
                          MUNICIPIOS.find((m) => m.codigo === r.municipioCodigo)
                            ?.regiao === regiao,
                      ).length
                    }
                  </strong>
                </p>
              ))}
            </div>
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            {(
              [
                ["tipo", "Tipos de organização"],
                ["categoria", "Atividades principais"],
                ["produtos", "Produtos e serviços"],
              ] as const
            ).map(([key, title]) => (
              <section className="card p-5" key={key}>
                <h2 className="font-display text-xl">{title}</h2>
                <p className="mt-2 text-xs text-forest-500">
                  Quantidade de parceiros por item
                </p>
                <ul className="mt-4 space-y-3">
                  {distribution(key).map(([label, count]) => (
                    <li key={label}>
                      <div className="flex justify-between gap-3 text-sm">
                        <span className="break-words">{label}</span>
                        <strong>{count}</strong>
                      </div>
                      <div className="mt-1 h-2 rounded bg-forest-50">
                        <div
                          className="h-2 rounded bg-forest-600"
                          style={{
                            width: `${rows.length ? (count / rows.length) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
                {!distribution(key).length && (
                  <p className="mt-4 text-sm text-forest-500">
                    Sem informações neste filtro.
                  </p>
                )}
              </section>
            ))}
          </div>
          <section className="card mt-6 p-5">
            <h2 className="font-display text-xl">
              Parceiros nos filtros selecionados
            </h2>
            <ul className="mt-4 divide-y divide-forest-100">
              {rows.map((r) => (
                <li
                  className="flex flex-wrap items-start justify-between gap-3 py-4"
                  key={r.id}
                >
                  <div>
                    <p className="font-semibold">{r.nome}</p>
                    <p className="text-sm text-forest-500">
                      {
                        MUNICIPIOS.find((m) => m.codigo === r.municipioCodigo)
                          ?.nome
                      }{" "}
                      · {r.tipo} · {r.categoria}
                    </p>
                  </div>
                  {r.empresaId ? (
                    <Link
                      className="text-sm underline"
                      to={`/vitrine/${r.empresaId}`}
                    >
                      Ver perfil na vitrine
                    </Link>
                  ) : (
                    <span className="chip">Somente dashboard e parceria</span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
