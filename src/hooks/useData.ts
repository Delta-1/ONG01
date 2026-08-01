import { useEffect, useMemo, useState } from 'react'
import {
  fetchMunicipios,
  fetchEmpreendimentos,
  fetchNoticias,
  fetchLegislacao,
} from '../lib/queries'
import { MUNICIPIOS } from '../data/municipios'
import { EMPREENDIMENTOS, NOTICIAS, LEGISLACAO } from '../data/conteudo'
import type { Municipio, Empreendimento, Noticia, Legislacao } from '../data/types'

/**
 * Hooks de dados do Observatório.
 *
 * Cada hook começa com os dados LOCAIS (que espelham o Supabase), para o site
 * nunca aparecer vazio, e faz um "upgrade" para os dados ao vivo do Supabase
 * assim que a consulta responde. Se o Supabase falhar, permanece com o local.
 */

export function useMunicipios() {
  const [municipios, setMunicipios] = useState<Municipio[]>(MUNICIPIOS)

  useEffect(() => {
    let ativo = true
    fetchMunicipios().then((d) => ativo && d.length && setMunicipios(d))
    return () => {
      ativo = false
    }
  }, [])

  const byCode = useMemo(
    () => Object.fromEntries(municipios.map((m) => [m.codigo, m])) as Record<string, Municipio>,
    [municipios],
  )

  const totais = useMemo(
    () =>
      municipios.reduce(
        (acc, m) => {
          acc.empreendimentos += m.indicadores.empreendimentos
          acc.familias += m.indicadores.familias
          acc.producaoTon += m.indicadores.producaoTon
          acc.faturamentoMil += m.indicadores.faturamentoMil
          acc.areaManejadaHa += m.indicadores.areaManejadaHa
          return acc
        },
        { empreendimentos: 0, familias: 0, producaoTon: 0, faturamentoMil: 0, areaManejadaHa: 0 },
      ),
    [municipios],
  )

  return { municipios, byCode, totais }
}

export function useEmpreendimentos() {
  const [empreendimentos, setEmpreendimentos] = useState<Empreendimento[]>(EMPREENDIMENTOS)
  useEffect(() => {
    let ativo = true
    fetchEmpreendimentos().then((d) => ativo && d.length && setEmpreendimentos(d))
    return () => {
      ativo = false
    }
  }, [])
  return empreendimentos
}

export function useNoticias() {
  const [noticias, setNoticias] = useState<Noticia[]>(NOTICIAS)
  useEffect(() => {
    let ativo = true
    fetchNoticias().then((d) => ativo && d.length && setNoticias(d))
    return () => {
      ativo = false
    }
  }, [])
  return noticias
}

export function useLegislacao() {
  const [legislacao, setLegislacao] = useState<Legislacao[]>(LEGISLACAO)
  useEffect(() => {
    let ativo = true
    fetchLegislacao().then((d) => ativo && d.length && setLegislacao(d))
    return () => {
      ativo = false
    }
  }, [])
  return legislacao
}
