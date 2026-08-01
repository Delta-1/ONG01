-- Corrige o erro: "new row violates row-level security policy for table empreendimentos"
--
-- Contexto: o formulário "Enviar para curadoria" (src/pages/Cadastro.tsx) insere um
-- empreendimento como pendente (aprovado=false). A política antiga exigia
-- auth.uid() IS NOT NULL, mas o supabase.auth.signUp() NÃO cria sessão imediata
-- quando a confirmação de e-mail está ligada — então auth.uid() era NULL na hora do
-- insert e o RLS bloqueava a submissão.
--
-- Solução: a submissão para curadoria é pública por natureza. Qualquer visitante pode
-- enviar, MAS apenas como pendente (aprovado=false) e sem destaque (destaque=false).
-- Ninguém consegue se auto-aprovar ou se auto-destacar — a aprovação continua sendo
-- exclusiva do admin (política empreendimentos_update_admin, que exige is_admin()).

drop policy if exists empreendimentos_insert_empresa on public.empreendimentos;

create policy empreendimentos_insert_curadoria on public.empreendimentos
  for insert to public
  with check (
    coalesce(aprovado, false) = false
    and coalesce(destaque, false) = false
  );
