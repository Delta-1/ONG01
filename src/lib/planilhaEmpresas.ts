import type { Empreendimento } from "../data/types";
import { MUNICIPIOS } from "../data/municipios";

export interface CadastroExportacao {
  id: string;
  status: string;
  dados: {
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
    "Telefone público",
    "E-mail público",
    "Instagram",
    "Produtos ou serviços",
    "História",
    "Publicações aprovadas",
    "Publicações em análise",
    "Preenchido por",
  ];
  const rows: unknown[][] = empresas
    .filter((e) => !e.is_demo)
    .map((e) => {
      const m = MUNICIPIOS.find((m) => m.codigo === e.municipioCodigo);
      return [
        e.id,
        "Cadastro de empreendimento",
        e.aprovado ? "Aprovado" : "Em análise",
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
      ];
    });
  // Approved intakes already appear as enterprises; never duplicate them.
  for (const c of cadastros.filter((c) => c.status !== "aprovado")) {
    const d = c.dados,
      m = MUNICIPIOS.find((m) => m.codigo === d.municipio_codigo);
    rows.push([
      c.id,
      "Formulário rápido",
      c.status === "pendente"
        ? "Em análise (formulário)"
        : "Não aprovado (formulário)",
      d.nome,
      m?.nome,
      d.municipio_codigo,
      m?.regiao,
      d.categoria,
      "",
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
