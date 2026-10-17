import { useState } from "react";
import { Link } from "react-router-dom";
import AcreMap from "../components/AcreMap";
import { useMunicipios, useEmpreendimentos } from "../hooks/useData";
import { METRICA_POR_ID } from "../data/metricas";
import { Message } from "../components/FormUI";
export default function Dashboard() {
  const { municipios, byCode, totais, loading, error } = useMunicipios(),
    empresas = useEmpreendimentos(),
    [selected, setSelected] = useState<string | null>(null);
  const mun = selected ? byCode[selected] : null;
  const categories = [...new Set(empresas.map((e) => e.categoria))];
  return (
    <div className="container-page py-10">
      <span className="eyebrow">Base em construção com dados reais</span>
      <h1 className="mt-3 font-display text-3xl text-forest-900">
        Empreendimentos do Acre
      </h1>
      <p className="mt-3 max-w-3xl text-forest-600">
        Este mapa conta os empreendimentos reais que passaram pela curadoria e
        têm perfil publicado. Não representa um censo de todos os negócios do
        Acre.
      </p>
      {error && (
        <div className="mt-5">
          <Message error>{error}</Message>
        </div>
      )}
      {loading ? (
        <p className="py-10">Consultando cadastros validados…</p>
      ) : (
        <>
          <div className="mt-7 grid gap-4 sm:grid-cols-3">
            {[
              [totais.empreendimentos, "Empreendimentos publicados"],
              [
                municipios.filter((m) => m.indicadores.empreendimentos > 0)
                  .length,
                "Municípios com cadastros",
              ],
              [categories.length, "Cadeias representadas"],
            ].map(([n, label]) => (
              <div className="card p-6" key={label}>
                <strong className="font-display text-3xl">{n}</strong>
                <p className="mt-2 text-sm text-forest-500">{label}</p>
              </div>
            ))}
          </div>
          {!empresas.length && (
            <div className="mt-6">
              <Message>
                A coleta de dados reais começou. Os primeiros cadastros
                aparecerão após a aprovação.{" "}
                <Link className="underline" to="/cadastro">
                  Cadastre seu empreendimento
                </Link>
                .
              </Message>
            </div>
          )}
          <div className="mt-7 grid gap-6 lg:grid-cols-3">
            <div className="card p-5 lg:col-span-2">
              <h2 className="mb-4 font-display text-xl">
                Mapa dos 22 municípios
              </h2>
              <AcreMap
                metrica={METRICA_POR_ID.empreendimentos}
                selectedCode={selected}
                onSelect={setSelected}
                byCode={byCode}
              />
              <label className="mt-5 block text-sm font-semibold">
                Selecione um município
                <select
                  className="mt-2 w-full rounded-lg border border-forest-200 bg-white p-3"
                  value={selected ?? ""}
                  onChange={(e) => setSelected(e.target.value || null)}
                >
                  <option value="">Todos os municípios</option>
                  {municipios.map((m) => (
                    <option key={m.codigo} value={m.codigo}>
                      {m.nome}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="card p-6">
              <h2 className="font-display text-2xl">
                {mun?.nome ?? "Por região"}
              </h2>
              {mun ? (
                <>
                  <p className="mt-2 text-sm text-forest-500">{mun.regiao}</p>
                  <p className="mt-5">
                    {mun.indicadores.empreendimentos} empreendimento(s)
                    publicado(s)
                  </p>
                  <div className="mt-5 space-y-3">
                    {empresas
                      .filter((e) => e.municipioCodigo === mun.codigo)
                      .map((e) => (
                        <Link
                          className="block underline"
                          to={`/vitrine/${e.id}`}
                          key={e.id}
                        >
                          {e.nome}
                        </Link>
                      ))}
                  </div>
                </>
              ) : (
                ["Vale do Acre", "Vale do Juruá"].map((r) => (
                  <p className="mt-5" key={r}>
                    {r}:{" "}
                    <strong>
                      {municipios
                        .filter((m) => m.regiao === r)
                        .reduce((n, m) => n + m.indicadores.empreendimentos, 0)}
                    </strong>
                  </p>
                ))
              )}
            </div>
          </div>
          <p className="mt-6 text-sm text-forest-500">
            Produção, faturamento, famílias e área manejada só serão exibidos
            quando houver dados reais coletados e validados para esses
            indicadores.
          </p>
        </>
      )}
    </div>
  );
}
