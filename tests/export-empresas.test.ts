import assert from "node:assert/strict";
import { criarPlanilhaEmpresas } from "../src/lib/planilhaEmpresas";
import { readAllPages } from "../src/lib/pagination";

const empresa = {
  id: "real",
  nome: '=HYPERLINK("https://invalid")',
  municipioCodigo: "1200401",
  categoria: "Artesanato",
  historia: 'História com acento; aspas " e\nsegunda linha',
  produtos: ["Produto A", "Produto B"],
  contato: { telefone: "+5568999990000", email: "publico@example.invalid" },
  aprovado: true,
  cor: "#256b3d",
  owner_id: "NAO_EXPORTAR_ID_DE_ACESSO",
};
const intake = {
  id: "pendente",
  status: "pendente",
  dados: {
    nome: "Negócio em análise",
    municipio_codigo: "1200252",
    categoria: "Castanha",
    historia: "História",
    produtos: ["Castanha"],
    telefone: "68999990000",
    preenchido_por: "Equipe",
  },
};
const { csv, total } = criarPlanilhaEmpresas(
  [empresa, { ...empresa, id: "demo", is_demo: true }],
  [intake, { ...intake, id: "aprovado", status: "aprovado" }],
  [{ empreendimento_id: "real", status: "aprovado" }],
);
assert.equal(
  total,
  2,
  "Sem demonstrações nem duplicação de formulários aprovados",
);
assert.ok(csv.startsWith("\uFEFF"), "BOM para acentos no Excel");
assert.ok(csv.includes("Rio Branco") && csv.includes("Vale do Acre"));
assert.ok(
  csv.includes('"\'=HYPERLINK(""https://invalid"")"'),
  "Texto neutraliza fórmula",
);
assert.ok(csv.includes('"\'+5568999990000"'), "Telefone tratado como texto");
assert.ok(
  csv.includes('aspas "" e\nsegunda linha'),
  "Aspas, delimitador e quebras preservados",
);
assert.ok(!csv.includes("NAO_EXPORTAR_ID_DE_ACESSO"));
assert.ok(csv.includes("Em análise (formulário)"));
const source = Array.from({ length: 1205 }, (_, id) => ({ id }));
const pages = await readAllPages(async (from, to) => ({
  data: source.slice(from, Math.min(to + 1, from + 73)),
  error: null,
}));
assert.deepEqual(
  pages,
  source,
  "Todos os registros mesmo com limite da API inferior ao solicitado",
);
await assert.rejects(
  readAllPages(async () => ({
    data: null,
    error: new Error("API indisponível"),
  })),
  /API indisponível/,
);
console.log(
  "PASS: CSV com acentos, fórmulas neutralizadas, filas sem duplicação, dados de acesso excluídos e paginação completa com mais de 1000 registros",
);

const semVitrine = {
  ...intake,
  id: "dashboard-aprovado",
  status: "aprovado",
  empreendimento_id: null,
  dados: {
    ...intake.dados,
    finalidade: "dashboard" as const,
    tipo: "Associação",
    possui_cnpj: "nao",
    trabalhadores: 4,
    familias: null,
    ano_referencia: 2026,
  },
};
const updated = criarPlanilhaEmpresas([empresa], [semVitrine], []);
assert.equal(
  updated.total,
  2,
  "Parceiro aprovado sem vitrine deve entrar na exportação",
);
assert.ok(
  updated.csv.includes("Aprovado (dashboard)") &&
    updated.csv.includes("Ano de referência"),
);
assert.equal(criarPlanilhaEmpresas([], [{...semVitrine,dados:{...semVitrine.dados,is_demo:true}}], []).total,0,"Teste arquivado não entra nos relatórios");
