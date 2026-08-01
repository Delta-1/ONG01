import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts'
import AcreMap from '../components/AcreMap'
import { StatCard } from '../components/ui'
import { useMunicipios, useEmpreendimentos } from '../hooks/useData'
import { METRICAS, METRICA_POR_ID } from '../data/metricas'
import type { MetricaId } from '../data/metricas'
import { fmtInt, fmtReaisMil } from '../lib/format'

const REGIAO_CORES = { 'Vale do Acre': '#256b3d', 'Vale do Juruá': '#1c9aa6' }

export default function Dashboard() {
  const [metricaId, setMetricaId] = useState<MetricaId>('empreendimentos')
  const [selected, setSelected] = useState<string | null>(null)
  const metrica = METRICA_POR_ID[metricaId]

  const { municipios, byCode, totais } = useMunicipios()
  const empreendimentos = useEmpreendimentos()

  const ranking = useMemo(
    () =>
      [...municipios]
        .map((m) => ({ nome: m.nome, valor: metrica.get(m.indicadores), codigo: m.codigo }))
        .sort((a, b) => b.valor - a.valor)
        .slice(0, 8),
    [metrica, municipios],
  )

  const porRegiao = useMemo(() => {
    const acc: Record<string, number> = {}
    municipios.forEach((m) => {
      acc[m.regiao] = (acc[m.regiao] ?? 0) + metrica.get(m.indicadores)
    })
    return Object.entries(acc).map(([name, value]) => ({ name, value }))
  }, [metrica, municipios])

  const mun = selected ? byCode[selected] : null
  const munEmpreendimentos = selected
    ? empreendimentos.filter((e) => e.municipioCodigo === selected)
    : []

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="max-w-3xl">
        <span className="chip mb-3">Dashboard público · dados fictícios</span>
        <h1 className="font-display text-3xl font-800 text-forest-900 sm:text-4xl">
          Observatório de dados do Acre
        </h1>
        <p className="mt-3 text-forest-600">
          Explore os indicadores da sócio-bioeconomia por município. Passe o mouse sobre o mapa para
          visualizar os dados e clique em uma cidade para ver o detalhamento completo.
        </p>
      </div>

      {/* Totais estaduais */}
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Empreendimentos" value={fmtInt(totais.empreendimentos)} sub="mapeados no Acre" />
        <StatCard label="Famílias" value={fmtInt(totais.familias)} sub="nas cadeias produtivas" />
        <StatCard label="Faturamento/ano" value={fmtReaisMil(totais.faturamentoMil)} sub="movimentação estimada" />
        <StatCard label="Produção/ano" value={`${fmtInt(totais.producaoTon)} t`} sub="volume total" />
        <StatCard label="Área manejada" value={`${fmtInt(totais.areaManejadaHa)} ha`} sub="manejo sustentável" />
      </div>

      {/* Seletor de métrica */}
      <div className="mt-8 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-sm font-medium text-forest-500">Colorir mapa por:</span>
        {METRICAS.map((m) => (
          <button
            key={m.id}
            onClick={() => setMetricaId(m.id)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
              m.id === metricaId
                ? 'bg-forest-600 text-white shadow-sm'
                : 'border border-forest-200 text-forest-600 hover:bg-forest-100'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-5">
        {/* Mapa */}
        <div className="card p-4 sm:p-6 lg:col-span-3">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-display font-700 text-forest-800">Mapa dos 22 municípios</h3>
            <span className="text-xs text-forest-400">{metrica.descricao}</span>
          </div>
          <AcreMap metrica={metrica} selectedCode={selected} onSelect={setSelected} byCode={byCode} />
          {/* Legenda */}
          <div className="mt-3 flex items-center gap-3 text-xs text-forest-500">
            <span>menor</span>
            <div className="h-2.5 flex-1 rounded-full bg-gradient-to-r from-[#dbeede] to-[#1a442a]" />
            <span>maior</span>
          </div>
        </div>

        {/* Painel lateral */}
        <div className="lg:col-span-2">
          {mun ? (
            <div className="card animate-fade-up p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-forest-400">
                    {mun.regiao}
                  </p>
                  <h3 className="font-display text-xl font-700 text-forest-900">{mun.nome}</h3>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="rounded-full border border-forest-200 px-2.5 py-1 text-xs text-forest-500 hover:bg-forest-100"
                >
                  fechar
                </button>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-3">
                {METRICAS.map((m) => (
                  <div key={m.id} className="rounded-xl bg-forest-50 p-3">
                    <dt className="text-[11px] font-medium text-forest-400">{m.label}</dt>
                    <dd className="mt-0.5 font-display text-lg font-700 text-forest-700">
                      {m.format(m.get(mun.indicadores))}
                    </dd>
                  </div>
                ))}
              </dl>
              <div className="mt-4">
                <p className="text-xs font-medium text-forest-400">Principais cadeias</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {mun.indicadores.produtos.map((p) => (
                    <span key={p} className="chip">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
              {munEmpreendimentos.length > 0 && (
                <div className="mt-4 border-t border-forest-100 pt-4">
                  <p className="text-xs font-medium text-forest-400">Na vitrine</p>
                  <ul className="mt-2 space-y-1.5">
                    {munEmpreendimentos.map((e) => (
                      <li key={e.id}>
                        <Link
                          to={`/vitrine/${e.id}`}
                          className="flex items-center gap-2 text-sm text-forest-700 hover:text-forest-900"
                        >
                          <span className="h-2 w-2 rounded-full" style={{ background: e.cor }} />
                          {e.nome}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="card flex h-full flex-col justify-center p-6 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-forest-100 text-forest-500">
                <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M9 20l-5.5 2.5V6L9 3.5m0 16.5l6-2.5M9 20V3.5m6 14l5.5 2.5V6L15 3.5m0 14V3.5m0 0L9 6" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="mt-3 font-display font-600 text-forest-700">Selecione um município</p>
              <p className="mt-1 text-sm text-forest-500">
                Clique em uma cidade no mapa para ver todos os indicadores, cadeias produtivas e
                empreendimentos ligados a ela.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Gráficos */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <h3 className="font-display font-700 text-forest-800">Top municípios · {metrica.label}</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ranking} layout="vertical" margin={{ left: 8, right: 16 }}>
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="nome"
                  width={120}
                  tick={{ fontSize: 12, fill: '#256b3d' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: '#f0f7f1' }}
                  formatter={(v: number) => [metrica.format(v), metrica.label]}
                  contentStyle={{ borderRadius: 12, border: '1px solid #dbeede', fontSize: 12 }}
                />
                <Bar dataKey="valor" radius={[0, 6, 6, 0]}>
                  {ranking.map((r) => (
                    <Cell
                      key={r.codigo}
                      fill={selected === r.codigo ? '#eea01f' : '#35874e'}
                      cursor="pointer"
                      onClick={() => setSelected(r.codigo)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-display font-700 text-forest-800">Distribuição por região</h3>
          <div className="mt-2 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={porRegiao}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                >
                  {porRegiao.map((r) => (
                    <Cell key={r.name} fill={REGIAO_CORES[r.name as keyof typeof REGIAO_CORES]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => metrica.format(v)} contentStyle={{ borderRadius: 12, border: '1px solid #dbeede', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex justify-center gap-4">
            {porRegiao.map((r) => (
              <span key={r.name} className="flex items-center gap-1.5 text-xs text-forest-600">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: REGIAO_CORES[r.name as keyof typeof REGIAO_CORES] }} />
                {r.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-8 rounded-xl border border-dashed border-forest-200 bg-forest-50 p-4 text-center text-sm text-forest-500">
        ⚠️ Todos os números exibidos são <strong>fictícios</strong>, gerados para demonstração. A
        estrutura já está pronta para receber os dados reais via Supabase quando disponíveis.
      </p>
    </div>
  )
}
