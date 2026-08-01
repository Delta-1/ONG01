# Configuração de Autenticação — Supabase (ONG01)

Estas configurações ficam **no painel do Supabase** (não estão no código). Este
documento registra os valores exatos para não se perder. Projeto: **ONG01**
(`rzsmvlfmjjujbipghmsl`). Site em produção: **https://ong-brasil.vercel.app**

## 1. Confirmação de e-mail — DESLIGADA (decisão do produto)

Para reduzir a burocracia, o cadastro **não exige confirmação de e-mail**. O fluxo
tem 2 passos: criar conta → publicar o empreendimento (fica pendente de curadoria).

**Authentication → Providers → Email**
- Deixe **"Confirm email"** DESATIVADO.

Com isso, o `signUp()` já cria a sessão na hora e o usuário segue direto para
publicar. A política de RLS de insert é pública (ver `supabase/migrations/`), então
a publicação funciona mesmo que a confirmação esteja ligada — mas o recomendado,
conforme a decisão, é mantê-la desligada.

> Se um dia quiser reativar a confirmação (mais segurança contra spam), reative
> "Confirm email" aqui e me avise para eu religar a tela de espera no cadastro.

## 2. URLs de redirecionamento

**Authentication → URL Configuration**
- **Site URL:** `https://ong-brasil.vercel.app`
- **Redirect URLs** (adicionar):
  - `https://ong-brasil.vercel.app/**`
  - `http://localhost:5173/**` (desenvolvimento local com Vite)

Sem isso, o link do e-mail não retorna corretamente para o site.

## 3. Template do e-mail de confirmação (personalizado)

**Authentication → Email Templates → "Confirm signup"**
- **Assunto:** `Confirme seu cadastro no Observatório Acriano 🌱`
- **Corpo:** cole o conteúdo de [`supabase/templates/confirm-signup.html`](../supabase/templates/confirm-signup.html).

O template é em português, com a marca do Observatório e **não menciona o Supabase**.

## 4. Remetente (para o e-mail não parecer "do Supabase")

Por padrão, o Supabase envia de `noreply@mail.app.supabase.io` — esse endereço é o
que revela o Supabase, e o envio padrão é limitado (poucos e-mails por hora, serve
só para testes). Para o e-mail sair em nome do Observatório, configure **SMTP
próprio**:

**Authentication → SMTP Settings → Enable Custom SMTP**
- **Sender name:** `Observatório Acriano`
- **Sender email:** o e-mail do seu domínio/provedor (ex.: `contato@seudominio.com`)
- **Host / Port / User / Senha:** fornecidos pelo provedor de e-mail.

Provedores recomendados (têm plano gratuito):
- **Resend** — `smtp.resend.com`, porta `465`, usuário `resend`, senha = API key.
- **Brevo (ex-Sendinblue)** — `smtp-relay.brevo.com`, porta `587`.

> Enquanto o SMTP próprio não estiver configurado, o corpo do e-mail já estará
> personalizado, mas o **remetente** continuará sendo um endereço do Supabase.

## Políticas de RLS

As políticas do banco estão versionadas em
[`supabase/migrations/`](../supabase/migrations/).
