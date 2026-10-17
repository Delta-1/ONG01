import { createClient } from "npm:@supabase/supabase-js@2.57.4";
const allowed = new Set([
  "https://ong-brasil.vercel.app",
  "https://delta-1.github.io",
  "http://127.0.0.1:5173",
  "http://localhost:5173",
]);
Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin") || "";
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": allowed.has(origin)
      ? origin
      : "https://ong-brasil.vercel.app",
    "Access-Control-Allow-Headers":
      "authorization, apikey, content-type, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
    "Cache-Control": "no-store",
  };
  const send = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), { status, headers });
  if (origin && !allowed.has(origin))
    return send({ error: "Origem não autorizada." }, 403);
  if (req.method === "OPTIONS") return new Response("ok", { headers });
  if (req.method !== "POST")
    return send({ error: "Método não permitido." }, 405);
  try {
    if (Number(req.headers.get("content-length") || 0) > 20000)
      return send({ error: "Formulário muito grande." }, 413);
    const text = await req.text();
    if (text.length > 20000)
      return send({ error: "Formulário muito grande." }, 413);
    const body = JSON.parse(text);
    if (body.website)
      return send({ error: "Não foi possível enviar. Tente novamente." }, 400);
    if (
      typeof body.id !== "string" ||
      !body.dados ||
      typeof body.dados !== "object"
    )
      return send({ error: "Formulário inválido." }, 400);
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const digest = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(`${key}:${ip}`),
    );
    const rateKey = Array.from(new Uint8Array(digest))
      .map((x) => x.toString(16).padStart(2, "0"))
      .join("");
    const client = createClient(Deno.env.get("SUPABASE_URL")!, key, {
      auth: { persistSession: false },
    });
    const { data, error } = await client.rpc("receber_cadastro_rapido", {
      p_id: body.id,
      p_dados: body.dados,
      p_rate_key: rateKey,
    });
    if (error)
      return send(
        { error: error.message },
        error.message.includes("Limite") ? 429 : 400,
      );
    return send({
      id: data,
      message: "Cadastro recebido e enviado para análise da administração.",
    });
  } catch {
    return send(
      {
        error:
          "Não foi possível enviar o formulário. Confira os campos e tente novamente.",
      },
      400,
    );
  }
});
