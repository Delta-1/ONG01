import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { geoMercator, geoPath } from 'd3-geo'
import type { FeatureCollection, Geometry } from 'geojson'
import { FloatingLeaf } from './Leaf'

interface MunProps {
  id: string
  name: string
}

const W = 520
const H = 400

/**
 * Mapa do Acre para a home: ao passar o mouse, todo o estado se destaca e
 * aparece o nome "ACRE"; ao clicar, navega para o dashboard.
 */
export default function AcreMapHero() {
  const [geo, setGeo] = useState<FeatureCollection<Geometry, MunProps> | null>(null)
  const [hover, setHover] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    let ativo = true
    fetch(`${import.meta.env.BASE_URL}data/acre-municipios.geojson`)
      .then((r) => r.json())
      .then((d) => ativo && setGeo(d))
      .catch(() => {})
    return () => {
      ativo = false
    }
  }, [])

  const paths = useMemo(() => {
    if (!geo) return [] as string[]
    const projection = geoMercator().fitSize([W, H], geo)
    const path = geoPath(projection)
    return geo.features.map((f) => path(f) ?? '')
  }, [geo])

  return (
    <button
      type="button"
      onClick={() => navigate('/observatorio')}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-label="Abrir o dashboard do Observatório"
      className="group relative block w-full cursor-pointer focus:outline-none"
    >
      {/* Folhas decorativas */}
      <FloatingLeaf className="animate-sway absolute -left-4 -top-3 h-9 w-9 text-forest-400/70" />
      <FloatingLeaf
        className="animate-float absolute -right-2 bottom-6 h-7 w-7 text-forest-500/60"
        style={{ animationDelay: '1.2s' }}
      />

      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full overflow-visible drop-shadow">
        <defs>
          <filter id="heroLift" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="#0a2015" floodOpacity="0.35" />
          </filter>
        </defs>
        <g
          filter={hover ? 'url(#heroLift)' : undefined}
          style={{
            transform: hover ? 'translateY(-6px) scale(1.02)' : 'none',
            transformOrigin: 'center',
            transition: 'transform 300ms cubic-bezier(0.34,1.56,0.64,1)',
          }}
        >
          {paths.map((d, i) => (
            <path
              key={i}
              d={d}
              fill={hover ? '#256b3d' : '#35874e'}
              stroke="#ffffff"
              strokeWidth={0.8}
              style={{ transition: 'fill 250ms' }}
            />
          ))}
        </g>
        {hover && (
          <text
            x={W / 2}
            y={H / 2}
            textAnchor="middle"
            className="animate-fade-in fill-white font-display"
            style={{ fontSize: 54, fontWeight: 700, letterSpacing: 6, paintOrder: 'stroke' }}
            stroke="#0a2015"
            strokeWidth={3}
          >
            ACRE
          </text>
        )}
      </svg>

      <span className="mt-3 flex items-center justify-center gap-2 text-sm font-medium text-forest-700">
        <span className="rule" />
        {hover ? 'Clique para explorar o dashboard →' : 'Passe o mouse sobre o mapa'}
        <span className="rule" />
      </span>
    </button>
  )
}
