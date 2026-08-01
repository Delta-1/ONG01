import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { SectionTitle } from '../components/ui'
import { EMPREENDIMENTOS } from '../data/conteudo'
import { MUNICIPIOS_POR_CODIGO } from '../data/municipios'
import type { Empreendimento } from '../data/types'

function Card({ e }: { e: Empreendimento }) {
  const mun = MUNICIPIOS_POR_CODIGO[e.municipioCodigo]
  return (
    <Link
      to={`/vitrine/${e.id}`}
      className="group w-64 shrink-0 overflow-hidden rounded-2xl border border-forest-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative h-36" style={{ background: `linear-gradient(135deg, ${e.cor}, #0a2015)` }}>
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-600 text-forest-700">
          {e.categoria}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-display font-700 text-forest-800 group-hover:text-forest-900">{e.nome}</h3>
        <p className="mt-0.5 text-xs text-forest-500">{mun?.nome} · {mun?.regiao}</p>
        <p className="mt-2 line-clamp-2 text-sm text-forest-600">{e.historia}</p>
      </div>
    </Link>
  )
}

function Fileira({ titulo, itens }: { titulo: string; itens: Empreendimento[] }) {
  return (
    <div>
      <h3 className="mb-3 font-display text-lg font-700 text-forest-800">{titulo}</h3>
      <div className="no-scrollbar flex gap-4 overflow-x-auto pb-2">
        {itens.map((e) => (
          <Card key={e.id} e={e} />
        ))}
      </div>
    </div>
  )
}

export default function Vitrine() {
  const [busca, setBusca] = useState('')

  const filtrados = useMemo(
    () =>
      EMPREENDIMENTOS.filter(
        (e) =>
          e.aprovado &&
          (e.nome.toLowerCase().includes(busca.toLowerCase()) ||
            e.categoria.toLowerCase().includes(busca.toLowerCase()) ||
            e.produtos.some((p) => p.toLowerCase().includes(busca.toLowerCase()))),
      ),
    [busca],
  )

  const porCategoria = useMemo(() => {
    const acc: Record<string, Empreendimento[]> = {}
    filtrados.forEach((e) => {
      ;(acc[e.categoria] ??= []).push(e)
    })
    return Object.entries(acc)
  }, [filtrados])

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <SectionTitle
          eyebrow="Vitrine virtual"
          title="Empreendimentos da sociobiodiversidade"
          desc="Negócios da floresta, aprovados pela curadoria do Observatório. Conheça histórias, produtos e formas de contato."
        />
        <div className="relative sm:w-72">
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome, produto…"
            className="w-full rounded-full border border-forest-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-forest-400 focus:ring-2 focus:ring-forest-100"
          />
          <svg viewBox="0 0 24 24" className="absolute left-3.5 top-3 h-4 w-4 text-forest-400" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4-4" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      <div className="mt-10 space-y-10">
        {porCategoria.length === 0 && (
          <p className="rounded-xl border border-dashed border-forest-200 bg-forest-50 p-8 text-center text-forest-500">
            Nenhum empreendimento encontrado para “{busca}”.
          </p>
        )}
        {porCategoria.map(([cat, itens]) => (
          <Fileira key={cat} titulo={cat} itens={itens} />
        ))}
      </div>
    </div>
  )
}
