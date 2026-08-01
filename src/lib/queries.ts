import { supabase, isSupabaseConfigured } from './supabase'
import { MUNICIPIOS } from '../data/municipios'
import { EMPREENDIMENTOS, NOTICIAS, LEGISLACAO } from '../data/conteudo'
import type { Municipio, Empreendimento, Noticia, Legislacao } from '../data/types'

/**
 * Camada de acesso a dados do Observatório.
 *
 * O banco Supabase já está criado e populado (tabelas: municipios,
 * indicadores_municipio, empreendimentos, noticias, legislacao — todas com
 * RLS de leitura pública). Estas funções leem do Supabase quando ele está
 * configurado; caso contrário, usam os dados locais (que espelham o banco),
 * garantindo que o site nunca quebre.
 *
 * Para tornar o site 100% "ao vivo", basta trocar os imports dos dados locais
 * pelos hooks/consultas abaixo nas páginas.
 */

export async function fetchMunicipios(): Promise<Municipio[]> {
  if (!isSupabaseConfigured || !supabase) return MUNICIPIOS
  const { data, error } = await supabase
    .from('municipios')
    .select('codigo,nome,regiao,indicadores_municipio(empreendimentos,familias,producao_ton,faturamento_mil,area_manejada_ha,produtos)')
  if (error || !data) return MUNICIPIOS
  return data.map((m: Record<string, unknown>) => {
    const ind = (m.indicadores_municipio as Record<string, unknown>[] | null)?.[0]
    return {
      codigo: m.codigo as string,
      nome: m.nome as string,
      regiao: m.regiao as Municipio['regiao'],
      indicadores: {
        empreendimentos: Number(ind?.empreendimentos ?? 0),
        familias: Number(ind?.familias ?? 0),
        producaoTon: Number(ind?.producao_ton ?? 0),
        faturamentoMil: Number(ind?.faturamento_mil ?? 0),
        areaManejadaHa: Number(ind?.area_manejada_ha ?? 0),
        produtos: (ind?.produtos as string[]) ?? [],
      },
    }
  })
}

export async function fetchEmpreendimentos(): Promise<Empreendimento[]> {
  if (!isSupabaseConfigured || !supabase) return EMPREENDIMENTOS
  const { data, error } = await supabase
    .from('empreendimentos')
    .select('*')
    .eq('aprovado', true)
  if (error || !data) return EMPREENDIMENTOS
  return data.map((e: Record<string, unknown>) => ({
    id: e.id as string,
    nome: e.nome as string,
    municipioCodigo: e.municipio_codigo as string,
    categoria: e.categoria as string,
    historia: e.historia as string,
    produtos: (e.produtos as string[]) ?? [],
    contato: {
      telefone: (e.telefone as string) ?? '',
      email: (e.email as string) ?? '',
      instagram: (e.instagram as string) ?? undefined,
    },
    destaque: Boolean(e.destaque),
    aprovado: Boolean(e.aprovado),
    cor: (e.cor as string) ?? '#256b3d',
  }))
}

export async function fetchNoticias(): Promise<Noticia[]> {
  if (!isSupabaseConfigured || !supabase) return NOTICIAS
  const { data, error } = await supabase.from('noticias').select('*').order('data', { ascending: false })
  if (error || !data) return NOTICIAS
  return data.map((n: Record<string, unknown>) => ({
    id: n.id as string,
    titulo: n.titulo as string,
    resumo: n.resumo as string,
    data: n.data as string,
    categoria: n.categoria as string,
  }))
}

export async function fetchLegislacao(): Promise<Legislacao[]> {
  if (!isSupabaseConfigured || !supabase) return LEGISLACAO
  const { data, error } = await supabase.from('legislacao').select('*').order('ano', { ascending: false })
  if (error || !data) return LEGISLACAO
  return data.map((l: Record<string, unknown>) => ({
    id: l.id as string,
    titulo: l.titulo as string,
    descricao: l.descricao as string,
    esfera: l.esfera as Legislacao['esfera'],
    ano: Number(l.ano),
  }))
}
