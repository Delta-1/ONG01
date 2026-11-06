import type { DadosParceiro } from "./parceiros";
import type { Empreendimento } from "../data/types";
import { MUNICIPIOS } from "../data/municipios";
import { nomeParticipacao } from "./participacao";

export interface CadastroExportacao {
  id: string;
  status: string;
  empreendimento_id?: string | null;
  referencia_id?: string | null;
  created_at?: string;
  dados: DadosParceiro & {
    nome: string;
    municipio_codigo: string;
    categoria: string;
    historia: string;
    produtos: string[];
    telefone: string;
    email?: string;
    instagram?: string;
    comunidade?: string;
    responsavel?: string;
    preenchido_por: string;
    is_demo?: boolean;
  };
}
export interface PostExportacao {
  empreendimento_id: string;
  status: string;
}

function cell(value: unknown) {
  let text = String(value ?? "");
  // Quoting alone does not prevent spreadsheet formula execution.
  if (/^[\s\uFEFF]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text))
    text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}
export function criarPlanilhaEmpresas(
  empresas: Empreendimento[],
  cadastros: CadastroExportacao[],
  posts: PostExportacao[],
) {
  cadastros = cadastros.filter((c) => !c.dados.is_demo);
  const aprovadosAtuais = new Map<string, CadastroExportacao>();
  for (const cadastro of [...cadastros].sort((a, b) => (a.created_at ?? "").localeCompare(b.created_at ?? ""))) {
    if (cadastro.status === "aprovado") aprovadosAtuais.set(cadastro.referencia_id ?? cadastro.id, cadastro);
  }
  cadastros = cadastros.filter((c) => c.status !== "aprovado" || aprovadosAtuais.get(c.referencia_id ?? c.id)?.id === c.id);
  const counts = new Map<string, { approved: number; pending: number }>();
  for (const p of posts) {
    const value = counts.get(p.empreendimento_id) ?? {
      approved: 0,
      pending: 0,
    };
    if (p.status === "aprovado") value.approved++;
    if (p.status === "pendente") value.pending++;
    counts.set(p.empreendimento_id, value);
  }
  const headers = [
    "ID",
    "Origem",
    "Situação",
    "Empreendimento",
    "Município",
    "Código IBGE",
    "Região",
    "Categoria",
    "Tipo de organização",
    "Comunidade ou bairro",
    "Responsável",
    "Telefone para contato",
    "E-mail para contato",
    "Instagram",
    "Produtos ou serviços",
    "História",
    "Publicações aprovadas",
    "Publicações em análise",
    "Preenchido por",
    "Finalidade",
    "Possui CNPJ",
    "CNPJ informado",
    "Situação do CNPJ (declarada)",
    "Funcionamento",
    "Site",
    "Colaboração",
    "Pessoas que trabalham",
    "Famílias envolvidas",
    "Produção anual (t)",
    "Ano de referência",
  ];
  const extra = (d: DadosParceiro) => [
    nomeParticipacao(d.participacao, d.finalidade),
    d.possui_cnpj,
    d.cnpj?.replace(/^(.{2})(.{3})(.{3})(.{4})(.{2})$/, "$1.$2.$3/$4-$5"),
    d.situacao_cnpj,
    d.funcionamento,
    d.site,
    d.colaboracao,
    d.trabalhadores,
    d.familias,
    d.producao_anual_ton,
    d.ano_referencia,
  ];
  const intakeByEmpresa = new Map(
    cadastros
      .filter((c) => c.status === "aprovado" && c.empreendimento_id)
      .map((c) => [c.empreendimento_id, c.dados]),
  );
  const rows: unknown[][] = empresas
    .filter((e) => !e.is_demo)
    .map((e) => {
      const m = MUNICIPIOS.find((m) => m.codigo === e.municipioCodigo);
      return [
        e.id,
        "Cadastro de empreendimento",
        intakeByEmpresa.get(e.id)?.participacao === "dashboard" ? "Aprovado (dashboard)" : e.aprovado ? "Aprovado" : "Em análise",
        e.nome,
        m?.nome,
        e.municipioCodigo,
        m?.regiao,
        e.categoria,
        e.tipo,
        e.comunidade,
        e.responsavel,
        e.contato.telefone,
        e.contato.email,
        e.contato.instagram,
        e.produtos.join(" | "),
        e.historia,
        counts.get(e.id)?.approved ?? 0,
        counts.get(e.id)?.pending ?? 0,
        "",
        ...extra(intakeByEmpresa.get(e.id) ?? {}),
      ];
    });
  // Approved intakes already appear as enterprises; never duplicate them.
  for (const c of cadastros.filter(
    (c) =>
      c.status !== "aprovado" ||
      (c.dados.finalidade === "dashboard" && !c.empreendimento_id),
  )) {
    const d = c.dados,
      m = MUNICIPIOS.find((m) => m.codigo === d.municipio_codigo);
    rows.push([
      c.id,
      "Formulário rápido",
      c.status === "aprovado"
        ? "Aprovado (dashboard)"
        : c.status === "pendente"
          ? "Em análise (formulário)"
          : "Não aprovado (formulário)",
      d.nome,
      m?.nome,
      d.municipio_codigo,
      m?.regiao,
      d.categoria,
      d.tipo,
      d.comunidade,
      d.responsavel,
      d.telefone,
      d.email,
      d.instagram,
      d.produtos.join(" | "),
      d.historia,
      0,
      0,
      d.preenchido_por,
      ...extra(d),
    ]);
  }
  return {
    csv:
      "\uFEFF" +
      [headers, ...rows].map((row) => row.map(cell).join(";")).join("\r\n") +
      "\r\n",
    total: rows.length,
  };
}
