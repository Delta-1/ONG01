-- Approved dashboard partners expose only curated organization data, never intake contacts/CNPJ.
create table public.parceiros_observatorio (
 id uuid primary key references public.cadastros_rapidos(id) on delete cascade,
 empreendimento_id text unique references public.empreendimentos(id) on delete set null,
 nome text not null, municipio_codigo text not null references public.municipios(codigo),
 categoria text not null, tipo text not null, produtos text[] not null default '{}',
 site text not null default '', funcionamento text not null default 'nao_informado',
 trabalhadores integer check(trabalhadores between 0 and 10000000),
 familias integer check(familias between 0 and 10000000),
 producao_anual_ton numeric check(producao_anual_ton between 0 and 1000000000),
 ano_referencia integer check(ano_referencia between 2000 and 2100),
 aprovado boolean not null default false,
 created_at timestamptz not null default now()
);
alter table public.parceiros_observatorio enable row level security;
revoke all on public.parceiros_observatorio from anon,authenticated;
grant select on public.parceiros_observatorio to anon,authenticated;
grant all on public.parceiros_observatorio to service_role;
create policy parceiros_aprovados_read on public.parceiros_observatorio for select to anon,authenticated using(aprovado or (select private.is_admin()));
create index parceiros_municipio on public.parceiros_observatorio(municipio_codigo);

create function private.validar_dados_parceiro(d jsonb) returns jsonb language plpgsql security invoker set search_path='' as $$
declare v_novo boolean:=d ? 'finalidade' or d ? 'versao_formulario'; k text; n numeric; v_cnpj text;
begin
 if jsonb_typeof(d) is distinct from 'object' then raise exception 'Dados inválidos.'; end if;
 if not v_novo then return d; end if;
 if coalesce(d->>'finalidade','') not in ('vitrine','dashboard') then raise exception 'Escolha vitrine ou somente dashboard.'; end if;
 if coalesce(d->>'tipo','') not in ('Cooperativa','Associação','Empresa','Empreendedor individual','Coletivo comunitário','Instituição de ensino ou pesquisa','Organização da sociedade civil','Órgão público','Outro') then raise exception 'Selecione o tipo de organização.'; end if;
 if coalesce(d->>'funcionamento','') not in ('em_atividade','em_implantacao','inativo') then raise exception 'Informe se o empreendimento está funcionando.'; end if;
 if coalesce(d->>'possui_produtos','') not in ('sim','nao') then raise exception 'Informe se oferece produtos ou serviços.'; end if;
 if d->>'finalidade'='vitrine' and d->>'possui_produtos'<>'sim' then raise exception 'A vitrine exige produtos ou serviços. Escolha somente dashboard para colaborar sem catálogo.'; end if;
 if coalesce(d->>'possui_cnpj','') not in ('sim','nao','nao_sei') then raise exception 'Informe se possui CNPJ.'; end if;
 if d->>'possui_cnpj'='sim' then
  v_cnpj:=regexp_replace(upper(coalesce(d->>'cnpj','')),'[^A-Z0-9]','','g');
  if v_cnpj !~ '^[A-Z0-9]{12}[0-9]{2}$' then raise exception 'Informe o CNPJ completo com 14 caracteres.'; end if;
  if coalesce(d->>'situacao_cnpj','') not in ('ativo','inativo','nao_sei') then raise exception 'Informe a situação declarada do CNPJ.'; end if;
  d:=d||jsonb_build_object('cnpj',v_cnpj);
 else d:=d-'cnpj'-'situacao_cnpj'; end if;
 if length(coalesce(d->>'site',''))>500 or (coalesce(d->>'site','')<>'' and d->>'site' !~ '^https?://[^[:space:]]+$') then raise exception 'Informe um site com http:// ou https://.'; end if;
 if length(coalesce(d->>'colaboracao',''))>2000 or (d->>'finalidade'='dashboard' and length(trim(coalesce(d->>'colaboracao','')))<10) then raise exception 'Conte como a organização pode colaborar com o Observatório.'; end if;
 if d->>'possui_produtos'='nao' then d:=d||jsonb_build_object('produtos','[]'::jsonb); end if;
 foreach k in array array['trabalhadores','familias','producao_anual_ton'] loop
  if d->>k is not null and d->>k<>'' then
   if d->>k !~ '^[0-9]+([.][0-9]{1,3})?$' then raise exception 'Informe quantidades válidas, sem valores negativos.'; end if;
   n:=(d->>k)::numeric;
   if n>(case when k='producao_anual_ton' then 1000000000 else 10000000 end) or (k<>'producao_anual_ton' and n<>trunc(n)) then raise exception 'Quantidade fora do limite permitido.'; end if;
   if coalesce(d->>'ano_referencia','') !~ '^[0-9]{4}$' then raise exception 'Informe o ano de referência das quantidades.'; end if;
  else d:=jsonb_set(d,array[k],'null'::jsonb); end if;
 end loop;
 if nullif(d->>'ano_referencia','') is not null then
  if d->>'ano_referencia' !~ '^[0-9]{4}$' or (d->>'ano_referencia')::integer not between 2000 and extract(year from now())::integer then raise exception 'Ano de referência inválido.'; end if;
 else d:=jsonb_set(d,'{ano_referencia}','null'::jsonb); end if;
 return d;
end; $$;
revoke all on function private.validar_dados_parceiro(jsonb) from public,anon,authenticated;
grant execute on function private.validar_dados_parceiro(jsonb) to service_role;

create or replace function public.receber_cadastro_rapido(p_id uuid,p_dados jsonb,p_rate_key text) returns uuid language plpgsql security invoker set search_path='' as $$
declare v_total integer;
begin
 p_dados:=private.validar_dados_parceiro(p_dados);
 if exists(select 1 from public.cadastros_rapidos where id=p_id) then return p_id; end if;
 if length(p_rate_key)<>64 then raise exception 'Solicitação inválida.'; end if;
 if length(trim(coalesce(p_dados->>'nome',''))) not between 3 and 160 then raise exception 'Informe o nome do empreendimento.'; end if;
 if not exists(select 1 from public.municipios where codigo=p_dados->>'municipio_codigo') then raise exception 'Selecione um município do Acre.'; end if;
 if length(trim(coalesce(p_dados->>'categoria',''))) not between 3 and 120 then raise exception 'Informe a categoria.'; end if;
 if length(trim(coalesce(p_dados->>'historia',''))) not between 30 and 4000 then raise exception 'Conte sobre o negócio em pelo menos 30 caracteres.'; end if;
 if length(trim(coalesce(p_dados->>'telefone',''))) not between 8 and 30 then raise exception 'Informe um telefone de contato.'; end if;
 if length(trim(coalesce(p_dados->>'preenchido_por',''))) not between 2 and 160 then raise exception 'Informe quem está preenchendo o formulário.'; end if;
 if coalesce(p_dados->>'consentimento','false')<>'true' then raise exception 'Confirme a autorização de divulgação.'; end if;
 if jsonb_typeof(p_dados->'produtos') is distinct from 'array' then raise exception 'Informe os produtos ou serviços.'; end if;
 if jsonb_array_length(p_dados->'produtos') not between (case when p_dados->>'finalidade'='dashboard' and p_dados->>'possui_produtos'<>'sim' then 0 else 1 end) and 30 then raise exception 'Informe de 1 a 30 produtos ou serviços.'; end if;
 if octet_length(p_dados::text)>16000 then raise exception 'O formulário ultrapassou o tamanho permitido.'; end if;
 -- Atomic limit for the server-generated, salted network fingerprint.
 insert into private.form_rate_limits(rate_key,hora) values(p_rate_key,date_trunc('hour',now()))
 on conflict(rate_key,hora) do update set total=private.form_rate_limits.total+1 returning total into v_total;
 if v_total>60 then raise exception 'Limite de envios atingido. Tente novamente mais tarde.'; end if;
 delete from private.form_rate_limits where hora<now()-interval '24 hours';
 insert into public.cadastros_rapidos(id,dados) values(p_id,p_dados) on conflict(id) do nothing;
 return p_id;
end; $$;
revoke all on function public.receber_cadastro_rapido(uuid,jsonb,text) from public,anon,authenticated;
grant execute on function public.receber_cadastro_rapido(uuid,jsonb,text) to service_role;


create or replace function private.revisar_cadastro_rapido(p_id uuid,p_aprovar boolean,p_parecer text default '') returns text language plpgsql security definer set search_path='' as $$
declare v public.cadastros_rapidos; v_empresa text; v_produtos text[];
begin
 if not private.is_admin() then raise exception 'Somente administradores podem analisar cadastros.'; end if;
 select * into v from public.cadastros_rapidos where id=p_id for update;
 if not found or v.status<>'pendente' then raise exception 'Cadastro já analisado ou não encontrado.'; end if;
 if not p_aprovar and length(trim(p_parecer))<5 then raise exception 'Informe o motivo da não aprovação.'; end if;
 if p_aprovar then
  v.dados:=private.validar_dados_parceiro(v.dados);
  -- Serialize approval checks so simultaneous duplicate submissions cannot both pass.
  perform pg_advisory_xact_lock(hashtextextended(lower(trim(v.dados->>'nome'))||':'||(v.dados->>'municipio_codigo'),0));
  if v.dados->>'possui_cnpj'='sim' then
   perform pg_advisory_xact_lock(hashtextextended('cnpj:'||(v.dados->>'cnpj'),0));
   if exists(select 1 from public.cadastros_rapidos c where c.id<>p_id and c.status='aprovado' and regexp_replace(upper(c.dados->>'cnpj'),'[^A-Z0-9]','','g')=v.dados->>'cnpj') then raise exception 'Este CNPJ já tem um cadastro aprovado. Consulte o registro existente antes de cadastrar novamente.'; end if;
  end if;
  if exists(select 1 from public.parceiros_observatorio p where lower(trim(p.nome))=lower(trim(v.dados->>'nome')) and p.municipio_codigo=v.dados->>'municipio_codigo') or exists(select 1 from public.empreendimentos e where not e.is_demo and e.aprovado and lower(trim(e.nome))=lower(trim(v.dados->>'nome')) and e.municipio_codigo=v.dados->>'municipio_codigo') then raise exception 'Já existe um parceiro aprovado com este nome e município. Consulte o registro existente.'; end if;
  v_produtos:=array(select jsonb_array_elements_text(v.dados->'produtos'));
  if coalesce(v.dados->>'finalidade','vitrine')='vitrine' then
  v_empresa:=gen_random_uuid()::text;
  v_produtos:=array(select jsonb_array_elements_text(v.dados->'produtos'));
  insert into public.empreendimentos(id,nome,municipio_codigo,categoria,historia,produtos,telefone,email,instagram,comunidade,responsavel,tipo,aprovado,cor)
  values(v_empresa,trim(v.dados->>'nome'),v.dados->>'municipio_codigo',trim(v.dados->>'categoria'),trim(v.dados->>'historia'),v_produtos,
  left(trim(v.dados->>'telefone'),30),left(trim(coalesce(v.dados->>'email','')),254),left(trim(coalesce(v.dados->>'instagram','')),100),left(trim(coalesce(v.dados->>'comunidade','')),200),left(trim(coalesce(v.dados->>'responsavel','')),160),left(coalesce(v.dados->>'tipo','Empreendedor individual'),80),true,'#256b3d');
  insert into public.publicacoes(empreendimento_id,created_by,titulo,conteudo,produtos,status,reviewed_at,reviewed_by)
  values(v_empresa,auth.uid(),left('Conheça '||trim(v.dados->>'nome'),140),trim(v.dados->>'historia'),v_produtos,'aprovado',now(),auth.uid());
  insert into public.avisos(empreendimento_id,mensagem) values(v_empresa,'O cadastro enviado pela equipe foi aprovado. Seu perfil já está na vitrine.');
  end if;
  insert into public.parceiros_observatorio(id,empreendimento_id,nome,municipio_codigo,categoria,tipo,produtos,site,funcionamento,trabalhadores,familias,producao_anual_ton,ano_referencia,aprovado)
  values(v.id,v_empresa,trim(v.dados->>'nome'),v.dados->>'municipio_codigo',trim(v.dados->>'categoria'),coalesce(v.dados->>'tipo','Não informado'),v_produtos,coalesce(v.dados->>'site',''),coalesce(v.dados->>'funcionamento','nao_informado'),(v.dados->>'trabalhadores')::integer,(v.dados->>'familias')::integer,(v.dados->>'producao_anual_ton')::numeric,(v.dados->>'ano_referencia')::integer,true);
 end if;
 update public.cadastros_rapidos set status=case when p_aprovar then 'aprovado' else 'rejeitado' end,parecer=left(nullif(trim(p_parecer),''),1000),empreendimento_id=v_empresa,reviewed_at=now(),reviewed_by=auth.uid() where id=p_id;
 return v_empresa;
end; $$;
revoke all on function private.revisar_cadastro_rapido(uuid,boolean,text) from public;
grant execute on function private.revisar_cadastro_rapido(uuid,boolean,text) to authenticated;
create or replace function public.revisar_cadastro_rapido(p_id uuid,p_aprovar boolean,p_parecer text default '') returns text language sql security invoker set search_path='' as $$ select private.revisar_cadastro_rapido(p_id,p_aprovar,p_parecer); $$;
revoke all on function public.revisar_cadastro_rapido(uuid,boolean,text) from public,anon;
grant execute on function public.revisar_cadastro_rapido(uuid,boolean,text) to authenticated;

