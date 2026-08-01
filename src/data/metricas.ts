import type { IndicadoresMunicipio } from './types'
import { fmtInt, fmtReaisMil } from '../lib/format'

export type MetricaId =
  | 'empreendimentos'
  | 'familias'
  | 'producaoTon'
  | 'faturamentoMil'
  | 'areaManejadaHa'

export interface MetricaDef {
  id: MetricaId
  label: string
  descricao: string
  get: (i: IndicadoresMunicipio) => number
  format: (v: number) => string
  unidade: string
}

export const METRICAS: MetricaDef[] = [
  {
    id: 'empreendimentos',
    label: 'Empreendimentos',
    descricao: 'Negócios da sociobiodiversidade mapeados',
    get: (i) => i.empreendimentos,
    format: (v) => fmtInt(v),
    unidade: 'unidades',
  },
  {
    id: 'familias',
    label: 'Famílias envolvidas',
    descricao: 'Produtores e famílias nas cadeias produtivas',
    get: (i) => i.familias,
    format: (v) => fmtInt(v),
    unidade: 'famílias',
  },
  {
    id: 'faturamentoMil',
    label: 'Faturamento anual',
    descricao: 'Movimentação econômica estimada',
    get: (i) => i.faturamentoMil,
    format: (v) => fmtReaisMil(v),
    unidade: 'R$',
  },
  {
    id: 'producaoTon',
    label: 'Produção anual',
    descricao: 'Volume produzido pelas cadeias',
    get: (i) => i.producaoTon,
    format: (v) => `${fmtInt(v)} t`,
    unidade: 'toneladas',
  },
  {
    id: 'areaManejadaHa',
    label: 'Área manejada',
    descricao: 'Área sob manejo sustentável',
    get: (i) => i.areaManejadaHa,
    format: (v) => `${fmtInt(v)} ha`,
    unidade: 'hectares',
  },
]

export const METRICA_POR_ID: Record<MetricaId, MetricaDef> = Object.fromEntries(
  METRICAS.map((m) => [m.id, m]),
) as Record<MetricaId, MetricaDef>
