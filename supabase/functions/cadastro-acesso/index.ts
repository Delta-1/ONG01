import { createClient } from "npm:@supabase/supabase-js@2.111.0";

const origins = new Set([
  "https://observatorio.comitechicomendes.org", "https://observatorio-ccm.vercel.app",
  "https://ong-brasil.vercel.app", "https://delta-1.github.io",
  "http://terminal.local:4173", "http://localhost:5173", "http://127.0.0.1:5173",
]);
const preview = /^https:\/\/(?:ong-brasil-[a-z0-9-]+-delta1s-projects|observatorio(?:-ccm)?-[a-z0-9-]+-observatorio9)\.vercel\.app$/;
Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin") ?? "";
  const allowed = origins.has(origin) || preview.test(origin);
  const headers = { "Content-Type": "application/json", "Cache-Control": "no-store", "Access-Control-Allow-Origin": allowed ? origin : "https://observatorio.comitechicomendes.org", "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info", "Access-Control-Allow-Methods": "POST, OPTIONS", Vary: "Origin" };
  const send = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers });
  if (origin && !allowed) return send({ error: "Origem não autorizada." }, 403);
  if (req.method === "OPTIONS") return new Response("ok", { headers });
  if (req.method !== "POST") return send({ error: "Método não permitido." }, 405);
  try {
    if (Number(req.headers.get("content-length") ?? 0) > 3000) return send({ error: "Cadastro muito grande." }, 413);
    const raw = await req.text();
    if (raw.length > 3000) return send({ error: "Cadastro muito grande." }, 413);
    const body = JSON.parse(raw);
    if (body.website) return send({ error: "Não foi possível cadastrar." }, 400);
    const nome = typeof body.nome === "string" ? body.nome.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (nome.length < 2 || nome.length > 160 || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 10 || password.length > 128) return send({ error: "Informe seu nome, um e-mail válido e uma senha de pelo menos 10 caracteres." }, 400);
    const url = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const server = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
    async function fingerprint(value: string) {
      const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(serviceKey + ":cadastro-acesso:" + value));
      return Array.from(new Uint8Array(bytes)).map((n) => n.toString(16).padStart(2, "0")).join("");
    }
    const [rede, destino] = await Promise.all([fingerprint("rede:" + ip), fingerprint("email:" + email)]);
    const rate = await server.rpc("reservar_cadastro_acesso", { p_rede: rede, p_email: destino });
    if (rate.error) return send({ error: "Limite de tentativas atingido. Tente mais tarde ou entre na conta que já criou." }, 429);
    // Somente contas novas; nenhum e-mail, senha ou permissão de conta existente é alterado.
    const created = await server.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { nome } });
    if (created.error) return send({ error: "Não foi possível criar esse acesso. Se já tem conta, use Entrar ou Redefinir senha." }, 400);
    const client = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const signed = await client.auth.signInWithPassword({ email, password });
    if (signed.error || !signed.data.session) return send({ error: "A conta foi criada. Use Entrar para acessar seu painel." }, 400);
    return send({ session: { access_token: signed.data.session.access_token, refresh_token: signed.data.session.refresh_token } });
  } catch {
    return send({ error: "Não foi possível concluir o cadastro. Confira os campos e tente novamente." }, 400);
  }
});
