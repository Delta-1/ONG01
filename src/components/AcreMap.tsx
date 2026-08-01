import { useEffect, useMemo, useRef, useState } from 'react'
import { geoMercator, geoPath } from 'd3-geo'
import type { FeatureCollection, Feature, Geometry } from 'geojson'
import { MUNICIPIOS_POR_CODIGO } from '../data/municipios'
import type { MetricaDef } from '../data/metricas'

interface MunProps {
  id: string
  name: string
}

const WIDTH = 760
const HEIGHT = 560

/** Interpola entre dois tons de verde conforme t ∈ [0,1]. */
function colorScale(t: number): string {
  // forest-100 (#dbeede) -> forest-800 (#1a442a)
  const from = [0xdb, 0xee, 0xde]
  const to = [0x1a, 0x44, 0x2a]
  const c = from.map((f, i) => Math.round(f + (to[i] - f) * t))
  return `rgb(${c[0]},${c[1]},${c[2]})`
}

interface Props {
  metrica: MetricaDef
  selectedCode: string | null
  onSelect: (code: string | null) => void
}

export default function AcreMap({ metrica, selectedCode, onSelect }: Props) {
  const [geo, setGeo] = useState<FeatureCollection<Geometry, MunProps> | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [hover, setHover] = useState<string | null>(null)
  const [tip, setTip] = useState<{ x: number; y: number } | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let ativo = true
    fetch(`${import.meta.env.BASE_URL}data/acre-municipios.geojson`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((d) => ativo && setGeo(d))
      .catch((e) => ativo && setErro(String(e)))
    return () => {
      ativo = false
    }
  }, [])

  const { paths, domain } = useMemo(() => {
    if (!geo) return { paths: [] as { code: string; name: string; d: string }[], domain: [0, 1] }
    const projection = geoMercator().fitSize([WIDTH, HEIGHT], geo)
    const path = geoPath(projection)
    const values = geo.features.map(
      (f) => metrica.get(MUNICIPIOS_POR_CODIGO[f.properties.id]?.indicadores ?? ({} as never)) || 0,
    )
    const paths = geo.features.map((f: Feature<Geometry, MunProps>) => ({
      code: f.properties.id,
      name: f.properties.name,
      d: path(f) ?? '',
    }))
    return { paths, domain: [Math.min(...values), Math.max(...values)] as [number, number] }
  }, [geo, metrica])

  const norm = (code: string) => {
    const v = metrica.get(MUNICIPIOS_POR_CODIGO[code]?.indicadores ?? ({} as never)) || 0
    const [min, max] = domain
    return max === min ? 0.5 : (v - min) / (max - min)
  }

  const hoverMun = hover ? MUNICIPIOS_POR_CODIGO[hover] : null

  function handleMove(e: React.MouseEvent) {
    const rect = wrapRef.current?.getBoundingClientRect()
    if (!rect) return
    setTip({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  if (erro) {
    return (
      <div className="grid h-[420px] place-items-center rounded-2xl border border-forest-100 bg-white text-sm text-forest-500">
        Não foi possível carregar o mapa ({erro}).
      </div>
    )
  }

  return (
    <div ref={wrapRef} className="relative" onMouseMove={handleMove}>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-auto w-full"
        role="img"
        aria-label="Mapa interativo dos municípios do Acre"
      >
        <defs>
          <filter id="mapShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#0a2015" floodOpacity="0.18" />
          </filter>
        </defs>
        {!geo && (
          <text x={WIDTH / 2} y={HEIGHT / 2} textAnchor="middle" className="fill-forest-400 text-lg">
            Carregando mapa…
          </text>
        )}
        <g filter="url(#mapShadow)">
          {paths.map((p) => {
            const isHover = hover === p.code
            const isSel = selectedCode === p.code
            return (
              <path
                key={p.code}
                d={p.d}
                fill={colorScale(norm(p.code))}
                stroke={isSel ? '#eea01f' : '#ffffff'}
                strokeWidth={isSel ? 3 : isHover ? 1.8 : 0.8}
                className="cursor-pointer transition-[fill,opacity] duration-150"
                style={{ opacity: hover && !isHover && !isSel ? 0.72 : 1 }}
                onMouseEnter={() => setHover(p.code)}
                onMouseLeave={() => setHover(null)}
                onClick={() => onSelect(selectedCode === p.code ? null : p.code)}
              >
                <title>{p.name}</title>
              </path>
            )
          })}
        </g>
      </svg>

      {hoverMun && tip && (
        <div
          className="pointer-events-none absolute z-20 w-56 -translate-y-2 rounded-xl border border-forest-100 bg-white/95 p-3 shadow-lg backdrop-blur"
          style={{
            left: Math.min(tip.x + 14, (wrapRef.current?.clientWidth ?? WIDTH) - 236),
            top: Math.max(tip.y - 10, 0),
          }}
        >
          <p className="font-display text-sm font-700 text-forest-800">{hoverMun.nome}</p>
          <p className="text-[11px] font-medium text-forest-400">{hoverMun.regiao}</p>
          <div className="mt-2 flex items-baseline justify-between gap-2">
            <span className="text-xs text-forest-500">{metrica.label}</span>
            <span className="font-display text-base font-700 text-forest-700">
              {metrica.format(metrica.get(hoverMun.indicadores))}
            </span>
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {hoverMun.indicadores.produtos.slice(0, 3).map((prod) => (
              <span key={prod} className="rounded-full bg-forest-50 px-2 py-0.5 text-[10px] text-forest-600">
                {prod}
              </span>
            ))}
          </div>
          <p className="mt-2 text-[10px] text-forest-400">Clique para ver todos os dados</p>
        </div>
      )}
    </div>
  )
}
