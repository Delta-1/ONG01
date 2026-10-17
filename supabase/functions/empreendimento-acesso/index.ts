import { createClient } from "npm:@supabase/supabase-js@2.57.4";
const site = Deno.env.get("SITE_URL") || "https://ong-brasil.vercel.app";
const allowed = new Set([
  new URL(site).origin,
  "https://delta-1.github.io",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);
Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin") || "";
  const cors = {
    "Access-Control-Allow-Origin": allowed.has(origin)
      ? origin
      : new URL(site).origin,
    "Access-Control-Allow-Headers":
      "authorization, apikey, content-type, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
  const respond = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: {
        ...cors,
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  if (origin && !allowed.has(origin))
    return respond({ error: "Origem não autorizada." }, 403);
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST")
    return respond({ error: "Método não permitido." }, 405);
  try {
    const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
    if (!token) return respond({ error: "Entre novamente." }, 401);
    const client = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const { data: auth, error: authError } = await client.auth.getUser(token);
    if (authError || !auth.user)
      return respond({ error: "Sessão inválida." }, 401);
    const { data: actor, error: profileError } = await client
      .from("profiles")
      .select("role")
      .eq("id", auth.user.id)
      .single();
    if (profileError || actor?.role !== "admin")
      return respond({ error: "Acesso exclusivo da administração." }, 403);
    const { action, empresa_id, email: rawEmail } = await req.json();
    if (
      !["details", "invite", "temporary", "email", "reset"].includes(action) ||
      typeof empresa_id !== "string"
    )
      return respond({ error: "Solicitação inválida." }, 400);
    const { data: empresa, error: companyError } = await client
      .from("empreendimentos")
      .select("id,owner_id,is_demo")
      .eq("id", empresa_id)
      .single();
    if (companyError || !empresa || empresa.is_demo)
      return respond({ error: "Empreendimento real não encontrado." }, 404);
    let owner = empresa.owner_id
      ? (await client.auth.admin.getUserById(empresa.owner_id)).data.user
      : null;
    if (action === "details")
      return respond({
        email: owner?.email ?? "",
        has_account: Boolean(owner),
      });
    if (action === "reset") {
      if (!owner?.email)
        return respond({ error: "Crie ou vincule o acesso primeiro." }, 400);
      const { error } = await client.auth.resetPasswordForEmail(owner.email, {
        redirectTo: `${site}/redefinir-senha`,
      });
      if (error) throw error;
      return respond({
        message: "Link de redefinição solicitado para o e-mail da conta.",
      });
    }
    const email =
      typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254)
      return respond({ error: "Informe um e-mail válido." }, 400);
    if (action === "email") {
      if (!owner)
        return respond({ error: "Este negócio ainda não possui conta." }, 400);
      const { error } = await client.auth.admin.updateUserById(owner.id, {
        email,
        email_confirm: true,
      });
      if (error) throw error;
      return respond({
        message:
          "E-mail de acesso alterado. O contato público não foi alterado.",
        email,
      });
    }
    if (owner && owner.email?.toLowerCase() !== email)
      return respond(
        { error: "Use Alterar e-mail antes de redefinir ou gerar o acesso." },
        400,
      );
    // Locate an existing account without silently replacing one belonging to another company.
    if (!owner) {
      for (let page = 1; page <= 50; page++) {
        const { data, error } = await client.auth.admin.listUsers({
          page,
          perPage: 100,
        });
        if (error) throw error;
        owner =
          data.users.find((u) => u.email?.toLowerCase() === email) ?? null;
        if (owner || data.users.length < 100) break;
      }
    }
    if (owner) {
      const [{ data: p }, { data: linked }] = await Promise.all([
        client.from("profiles").select("role").eq("id", owner.id).single(),
        client
          .from("empreendimentos")
          .select("id")
          .eq("owner_id", owner.id)
          .neq("id", empresa.id),
      ]);
      if (p?.role !== "empresa" || linked?.length)
        return respond(
          {
            error:
              "Esta conta já está vinculada a outro empreendimento ou é administrativa.",
          },
          409,
        );
    }
    const temporary =
      action === "temporary"
        ? `Acre!${crypto.randomUUID().replaceAll("-", "").slice(0, 18)}`
        : null;
    let newUserId: string | null = null;
    if (!owner) {
      const result = temporary
        ? await client.auth.admin.createUser({
            email,
            password: temporary,
            email_confirm: true,
          })
        : await client.auth.admin.inviteUserByEmail(email, {
            redirectTo: `${site}/redefinir-senha`,
          });
      if (result.error) throw result.error;
      owner = result.data.user;
      newUserId = owner?.id ?? null;
    } else if (temporary) {
      const { error } = await client.auth.admin.updateUserById(owner.id, {
        password: temporary,
      });
      if (error) throw error;
    }
    if (!owner)
      return respond({ error: "Não foi possível criar o acesso." }, 400);
    const { error: linkError } = await client.rpc("admin_vincular_acesso", {
      p_empresa: empresa.id,
      p_usuario: owner.id,
    });
    if (linkError) {
      if (newUserId) await client.auth.admin.deleteUser(newUserId);
      throw linkError;
    }
    if (!temporary && !newUserId) {
      const { error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: `${site}/redefinir-senha`,
      });
      if (error)
        return respond({
          message:
            "Conta vinculada, mas o provedor não enviou o e-mail. Use Enviar redefinição novamente.",
          email,
          email_sent: false,
        });
    }
    return respond({
      email,
      temporary_password: temporary,
      message: temporary
        ? "Acesso gerado. Copie a senha agora e entregue ao responsável. Ela não poderá ser consultada depois."
        : "Acesso vinculado e convite de acesso solicitado por e-mail.",
    });
  } catch (error) {
    return respond(
      {
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível gerenciar o acesso.",
      },
      400,
    );
  }
});
