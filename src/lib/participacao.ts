export type Participacao = "vitrine" | "dashboard" | "ambos";
export const OPCOES_PARTICIPACAO: { id: Participacao; titulo: string; descricao: string }[] = [
  { id: "ambos", titulo: "Vitrine e dashboard", descricao: "Quero divulgar produtos ou serviços e contribuir com o mapeamento do Acre." },
  { id: "vitrine", titulo: "Somente vitrine", descricao: "Quero apresentar meu trabalho, meus produtos ou serviços e meu contato público." },
  { id: "dashboard", titulo: "Somente dashboard", descricao: "Quero contribuir com dados, pesquisa ou parceria, sem um perfil na vitrine." },
];
export function nomeParticipacao(valor?: string, finalidade?: string) {
  return OPCOES_PARTICIPACAO.find((p) => p.id === valor)?.titulo ?? (finalidade === "dashboard" ? "Somente dashboard" : "Vitrine e dashboard");
}
export interface Contribuicao {
  id: string;
  dados: Record<string, unknown>;
  status: "pendente" | "aprovado" | "rejeitado";
  parecer: string | null;
  empreendimento_id: string | null;
  referencia_id: string | null;
  created_at: string;
  reviewed_at: string | null;
}
