-- Corrige o erro: "new row violates row-level security policy for table empreendimentos"
-- e alinha a política ao fluxo de cadastro com confirmação de e-mail.
--
-- Contexto: o formulário "Enviar para curadoria" (src/pages/Cadastro.tsx) insere um
-- empreendimento como pendente (aprovado=false). O fluxo agora exige que a pessoa
-- confirme o e-mail antes de publicar (tela de espera "Confirme seu e-mail"), então
-- na hora do insert o usuário JÁ está autenticado.
--
-- Política: apenas usuários AUTENTICADOS (e-mail confirmado) podem inserir, e somente
-- como pendente (aprovado=false) e sem destaque (destaque=false). Ninguém consegue se
-- auto-aprovar, se auto-destacar, nem enviar de forma anônima (evita spam). A aprovação
-- continua exclusiva do admin (política empreendimentos_update_admin, que exige is_admin()).

drop policy if exists empreendimentos_insert_empresa on public.empreendimentos;
drop policy if exists empreendimentos_insert_curadoria on public.empreendimentos;

create policy empreendimentos_insert_curadoria on public.empreendimentos
  for insert to authenticated
  with check (
    auth.uid() is not null
    and coalesce(aprovado, false) = false
    and coalesce(destaque, false) = false
  );
