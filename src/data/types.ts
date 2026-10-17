export type Regiao = "Vale do Acre" | "Vale do Juruá";

export interface IndicadoresMunicipio {
  /** Empreendimentos da sociobiodiversidade mapeados */
  empreendimentos: number;
  /** Famílias/produtores envolvidos */
  familias: number;
  /** Produção anual estimada (toneladas) */
  producaoTon: number;
  /** Faturamento anual estimado (R$ mil) */
  faturamentoMil: number;
  /** Área sob manejo sustentável (hectares) */
  areaManejadaHa: number;
  /** Principais cadeias produtivas */
  produtos: string[];
}

export interface Municipio {
  /** Código IBGE (chave usada no GeoJSON) */
  codigo: string;
  nome: string;
  regiao: Regiao;
  indicadores: IndicadoresMunicipio;
}

export interface Empreendimento {
  id: string;
  nome: string;
  municipioCodigo: string;
  categoria: string;
  historia: string;
  produtos: string[];
  contato: { telefone: string; email: string; instagram?: string };
  destaque?: boolean;
  aprovado: boolean;
  cor: string;
  comunidade?: string;
  responsavel?: string;
  tipo?: string;
  owner_id?: string | null;
  is_demo?: boolean;
}

export interface Noticia {
  id: string;
  titulo: string;
  resumo: string;
  data: string;
  categoria: string;
}

export interface Legislacao {
  id: string;
  titulo: string;
  descricao: string;
  esfera: "Federal" | "Estadual" | "Municipal";
  ano: number;
}

export interface Publicacao {
  id: string;
  empreendimento_id: string;
  titulo: string;
  conteudo: string;
  processo: string;
  impacto: string;
  produtos: string[];
  imagem_path: string | null;
  imagem_url?: string;
  status: "pendente" | "aprovado" | "rejeitado";
  parecer: string | null;
  created_at: string;
  reviewed_at: string | null;
}
export interface Aviso {
  id: string;
  empreendimento_id: string;
  mensagem: string;
  created_at: string;
}
