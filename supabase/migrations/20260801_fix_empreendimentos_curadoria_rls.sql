-- Corrige o erro: "new row violates row-level security policy for table empreendimentos".
--
-- Decisão do produto: o cadastro NÃO exige confirmação de e-mail (menos burocracia).
-- O formulário "Enviar para curadoria" (src/pages/Cadastro.tsx) insere um
-- empreendimento como pendente (aprovado=false) logo após a criação da conta.
--
-- Política: a submissão para curadoria é pública, para nunca falhar por falta de
-- sessão. Fica limitada a pendente (aprovado=false) e sem destaque (destaque=false),
-- então ninguém consegue se auto-aprovar nem se auto-destacar. A aprovação continua
-- exclusiva do admin (política empreendimentos_update_admin, que exige is_admin()).

drop policy if exists empreendimentos_insert_empresa on public.empreendimentos;
drop policy if exists empreendimentos_insert_curadoria on public.empreendimentos;

create policy empreendimentos_insert_curadoria on public.empreendimentos
  for insert to public
  with check (
    coalesce(aprovado, false) = false
    and coalesce(destaque, false) = false
  );
