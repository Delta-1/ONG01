export type Regiao = 'Vale do Acre' | 'Vale do Juruá'

export interface IndicadoresMunicipio {
  /** Empreendimentos da sociobiodiversidade mapeados */
  empreendimentos: number
  /** Famílias/produtores envolvidos */
  familias: number
  /** Produção anual estimada (toneladas) */
  producaoTon: number
  /** Faturamento anual estimado (R$ mil) */
  faturamentoMil: number
  /** Área sob manejo sustentável (hectares) */
  areaManejadaHa: number
  /** Principais cadeias produtivas */
  produtos: string[]
}

export interface Municipio {
  /** Código IBGE (chave usada no GeoJSON) */
  codigo: string
  nome: string
  regiao: Regiao
  indicadores: IndicadoresMunicipio
}

export interface Empreendimento {
  id: string
  nome: string
  municipioCodigo: string
  categoria: string
  historia: string
  produtos: string[]
  contato: { telefone: string; email: string; instagram?: string }
  destaque?: boolean
  aprovado: boolean
  cor: string
}

export interface Noticia {
  id: string
  titulo: string
  resumo: string
  data: string
  categoria: string
}

export interface Legislacao {
  id: string
  titulo: string
  descricao: string
  esfera: 'Federal' | 'Estadual' | 'Municipal'
  ano: number
}
