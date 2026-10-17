import { supabase } from "./supabase";
import { readAllPages } from "./pagination";
import { MUNICIPIOS } from "../data/municipios";
import type {
  Municipio,
  Empreendimento,
  Noticia,
  Legislacao,
  Publicacao,
  Aviso,
} from "../data/types";

export function db() {
  if (!supabase)
    throw new Error("O serviço está indisponível. Tente novamente mais tarde.");
  return supabase;
}
export function mapEmpresa(e: Record<string, unknown>): Empreendimento {
  return {
    id: String(e.id),
    nome: String(e.nome),
    municipioCodigo: String(e.municipio_codigo ?? ""),
    categoria: String(e.categoria ?? ""),
    historia: String(e.historia ?? ""),
    produtos: (e.produtos as string[]) ?? [],
    contato: {
      telefone: String(e.telefone ?? ""),
      email: String(e.email ?? ""),
      instagram: String(e.instagram ?? ""),
    },
    aprovado: Boolean(e.aprovado),
    destaque: Boolean(e.destaque),
    cor: String(e.cor ?? "#256b3d"),
    comunidade: String(e.comunidade ?? ""),
    responsavel: String(e.responsavel ?? ""),
    tipo: String(e.tipo ?? ""),
    owner_id: e.owner_id as string | null,
    is_demo: Boolean(e.is_demo),
  };
}
export async function fetchEmpreendimentos(): Promise<Empreendimento[]> {
  const data = await readAllPages((from, to) =>
    db()
      .from("empreendimentos")
      .select("*")
      .eq("is_demo", false)
      .eq("aprovado", true)
      .order("nome")
      .order("id")
      .range(from, to),
  );
  return data.map(mapEmpresa);
}
export async function fetchMunicipios(): Promise<Municipio[]> {
  const empresas = await fetchEmpreendimentos();
  return MUNICIPIOS.map((m) => ({
    ...m,
    indicadores: {
      ...m.indicadores,
      empreendimentos: empresas.filter((e) => e.municipioCodigo === m.codigo)
        .length,
      produtos: [
        ...new Set(
          empresas
            .filter((e) => e.municipioCodigo === m.codigo)
            .flatMap((e) => e.produtos),
        ),
      ],
    },
  }));
}
export async function fetchNoticias(): Promise<Noticia[]> {
  const { data, error } = await db()
    .from("noticias")
    .select("*")
    .eq("is_demo", false)
    .order("data", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Noticia[];
}
export async function fetchLegislacao(): Promise<Legislacao[]> {
  const { data, error } = await db()
    .from("legislacao")
    .select("*")
    .eq("is_demo", false)
    .order("ano", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Legislacao[];
}
export async function fetchMinhaEmpresa(userId: string) {
  const { data, error } = await db()
    .from("empreendimentos")
    .select("*")
    .eq("owner_id", userId)
    .eq("is_demo", false)
    .maybeSingle();
  if (error) throw error;
  return data ? mapEmpresa(data) : null;
}
export async function fetchEmpresasAdmin() {
  const data = await readAllPages((from, to) =>
    db()
      .from("empreendimentos")
      .select("*")
      .eq("is_demo", false)
      .order("created_at", { ascending: false })
      .order("id")
      .range(from, to),
  );
  return data.map(mapEmpresa);
}
export async function fetchPublicacoes(
  empresaId?: string,
): Promise<Publicacao[]> {
  let query = db()
    .from("publicacoes")
    .select("*")
    .order("created_at", { ascending: false });
  if (empresaId) query = query.eq("empreendimento_id", empresaId);
  const { data, error } = await query;
  if (error) throw error;
  return Promise.all(
    ((data ?? []) as Publicacao[]).map(async (p) => {
      if (!p.imagem_path) return p;
      const { data: img, error: imgError } = await db()
        .storage.from("publicacoes")
        .createSignedUrl(p.imagem_path, 900);
      if (imgError) return p;
      return { ...p, imagem_url: img?.signedUrl };
    }),
  );
}
export async function fetchAvisos(empresaId: string): Promise<Aviso[]> {
  const { data, error } = await db()
    .from("avisos")
    .select("*")
    .eq("empreendimento_id", empresaId)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) throw error;
  return (data ?? []) as Aviso[];
}
export function mensagemErro(error: unknown) {
  const message =
    error instanceof Error
      ? error.message
      : (error as { message?: string })?.message;
  if (message?.includes("Failed to fetch"))
    return "Não foi possível conectar. Verifique sua internet e tente novamente.";
  if (message?.includes("JWT") || message?.includes("session"))
    return "Sua sessão expirou. Entre novamente.";
  return message || "Não foi possível concluir a operação. Tente novamente.";
}
