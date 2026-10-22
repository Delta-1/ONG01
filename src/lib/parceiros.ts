export const TIPOS_ORGANIZACAO = [
  "Cooperativa",
  "Associação",
  "Empresa",
  "Empreendedor individual",
  "Coletivo comunitário",
  "Instituição de ensino ou pesquisa",
  "Organização da sociedade civil",
  "Órgão público",
  "Outro",
];
export interface DadosParceiro {
  finalidade?: "vitrine" | "dashboard";
  tipo?: string;
  possui_produtos?: string;
  possui_cnpj?: string;
  cnpj?: string;
  situacao_cnpj?: string;
  funcionamento?: string;
  site?: string;
  colaboracao?: string;
  trabalhadores?: number | null;
  familias?: number | null;
  producao_anual_ton?: number | null;
  ano_referencia?: number | null;
}
export interface RegistroObservatorio {
  id: string;
  nome: string;
  municipioCodigo: string;
  categoria: string;
  tipo: string;
  produtos: string[];
  empresaId: string | null;
  trabalhadores: number | null;
  familias: number | null;
  producao_anual_ton: number | null;
  ano_referencia: number | null;
  funcionamento: string;
  site: string;
}
export function resumoIndicador(
  rows: RegistroObservatorio[],
  key: "trabalhadores" | "familias" | "producao_anual_ton",
) {
  const informados = rows.filter((r) => r[key] !== null);
  return {
    total: informados.reduce((n, r) => n + (r[key] ?? 0), 0),
    informados: informados.length,
  };
}
