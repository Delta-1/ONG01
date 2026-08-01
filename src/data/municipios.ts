import type { Municipio, Regiao } from './types'

/**
 * DADOS FICTÍCIOS — apenas para desenvolvimento/demonstração.
 *
 * Os 22 municípios do Acre são reais (código IBGE + nome + região),
 * mas todos os INDICADORES abaixo são gerados de forma determinística
 * a partir do código IBGE. Quando os dados reais chegarem, basta trocar
 * a fonte por uma consulta ao Supabase (ver src/lib/supabase.ts).
 */

const VALE_JURUA = new Set([
  '1200203', // Cruzeiro do Sul
  '1200336', // Mâncio Lima
  '1200427', // Rodrigues Alves
  '1200393', // Porto Walter
  '1200351', // Marechal Thaumaturgo
  '1200609', // Tarauacá
  '1200302', // Feijó
  '1200328', // Jordão
])

const PRODUTOS = [
  'Castanha-do-Brasil',
  'Borracha / Látex',
  'Açaí',
  'Copaíba',
  'Farinha de mandioca',
  'Pirarucu manejado',
  'Mel de abelhas nativas',
  'Andiroba',
  'Artesanato indígena',
  'Cacau nativo',
  'Óleos essenciais',
  'Banana',
]

const BASE: { codigo: string; nome: string }[] = [
  { codigo: '1200013', nome: 'Acrelândia' },
  { codigo: '1200054', nome: 'Assis Brasil' },
  { codigo: '1200104', nome: 'Brasiléia' },
  { codigo: '1200138', nome: 'Bujari' },
  { codigo: '1200179', nome: 'Capixaba' },
  { codigo: '1200203', nome: 'Cruzeiro do Sul' },
  { codigo: '1200252', nome: 'Epitaciolândia' },
  { codigo: '1200302', nome: 'Feijó' },
  { codigo: '1200328', nome: 'Jordão' },
  { codigo: '1200336', nome: 'Mâncio Lima' },
  { codigo: '1200344', nome: 'Manoel Urbano' },
  { codigo: '1200351', nome: 'Marechal Thaumaturgo' },
  { codigo: '1200385', nome: 'Plácido de Castro' },
  { codigo: '1200807', nome: 'Porto Acre' },
  { codigo: '1200393', nome: 'Porto Walter' },
  { codigo: '1200401', nome: 'Rio Branco' },
  { codigo: '1200427', nome: 'Rodrigues Alves' },
  { codigo: '1200435', nome: 'Santa Rosa do Purus' },
  { codigo: '1200500', nome: 'Sena Madureira' },
  { codigo: '1200450', nome: 'Senador Guiomard' },
  { codigo: '1200609', nome: 'Tarauacá' },
  { codigo: '1200708', nome: 'Xapuri' },
]

/** PRNG determinístico simples (mulberry32) a partir do código IBGE. */
function seeded(code: string) {
  let a = Number(code) >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function pick<T>(arr: T[], rnd: () => number, n: number): T[] {
  const copy = [...arr]
  const out: T[] = []
  while (out.length < n && copy.length) {
    out.push(copy.splice(Math.floor(rnd() * copy.length), 1)[0])
  }
  return out
}

// Rio Branco (capital) recebe um peso maior para parecer realista.
const PESO_CAPITAL: Record<string, number> = { '1200401': 3.2 }

export const MUNICIPIOS: Municipio[] = BASE.map(({ codigo, nome }) => {
  const rnd = seeded(codigo)
  const peso = PESO_CAPITAL[codigo] ?? 1
  const regiao: Regiao = VALE_JURUA.has(codigo) ? 'Vale do Juruá' : 'Vale do Acre'
  const empreendimentos = Math.round((4 + rnd() * 14) * peso)
  const familias = Math.round(empreendimentos * (18 + rnd() * 55))
  return {
    codigo,
    nome,
    regiao,
    indicadores: {
      empreendimentos,
      familias,
      producaoTon: Math.round((40 + rnd() * 380) * peso),
      faturamentoMil: Math.round((120 + rnd() * 2200) * peso),
      areaManejadaHa: Math.round((800 + rnd() * 14000) * peso),
      produtos: pick(PRODUTOS, rnd, 2 + Math.floor(rnd() * 3)),
    },
  }
})

export const MUNICIPIOS_POR_CODIGO: Record<string, Municipio> = Object.fromEntries(
  MUNICIPIOS.map((m) => [m.codigo, m]),
)

export function totaisEstaduais() {
  return MUNICIPIOS.reduce(
    (acc, m) => {
      acc.empreendimentos += m.indicadores.empreendimentos
      acc.familias += m.indicadores.familias
      acc.producaoTon += m.indicadores.producaoTon
      acc.faturamentoMil += m.indicadores.faturamentoMil
      acc.areaManejadaHa += m.indicadores.areaManejadaHa
      return acc
    },
    { empreendimentos: 0, familias: 0, producaoTon: 0, faturamentoMil: 0, areaManejadaHa: 0 },
  )
}
