import { db, fetchEmpresasAdmin } from "./queries";
import { readAllPages } from "./pagination";
import {
  criarPlanilhaEmpresas,
  type CadastroExportacao,
} from "./planilhaEmpresas";
export async function carregarPlanilhaEmpresas() {
  const { data: admin, error } = await db().rpc("is_admin");
  if (error) throw error;
  if (!admin)
    throw new Error("Acesso administrativo necessário para exportar.");
  const [empresas, cadastros, posts] = await Promise.all([
    fetchEmpresasAdmin(),
    readAllPages((from, to) =>
      db()
        .from("cadastros_rapidos")
        .select("id,status,dados")
        .neq("status", "aprovado")
        .order("id")
        .range(from, to),
    ),
    readAllPages((from, to) =>
      db()
        .from("publicacoes")
        .select("id,empreendimento_id,status")
        .order("id")
        .range(from, to),
    ),
  ]);
  return criarPlanilhaEmpresas(
    empresas,
    cadastros as CadastroExportacao[],
    posts,
  );
}
