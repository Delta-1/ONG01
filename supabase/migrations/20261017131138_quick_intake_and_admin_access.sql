create table public.cadastros_rapidos (
 id uuid primary key,
 dados jsonb not null,
 status text not null default 'pendente' check(status in ('pendente','aprovado','rejeitado')),
 parecer text,
 empreendimento_id text references public.empreendimentos(id),
 created_at timestamptz not null default now(),
 reviewed_at timestamptz,
 reviewed_by uuid references auth.users(id)
);
alter table public.cadastros_rapidos enable row level security;
create index cadastros_rapidos_fila on public.cadastros_rapidos(status,created_at desc);
create policy cadastros_admin_read on public.cadastros_rapidos for select to authenticated using(private.is_admin());
revoke all on public.cadastros_rapidos from anon,authenticated;
grant select on public.cadastros_rapidos to authenticated;
grant all on public.cadastros_rapidos to service_role;
create table private.form_rate_limits(rate_key text not null,hora timestamptz not null,total integer not null default 1,primary key(rate_key,hora));
alter table private.form_rate_limits enable row level security;
revoke all on private.form_rate_limits from public,anon,authenticated;
grant all on private.form_rate_limits to service_role;

create function public.receber_cadastro_rapido(p_id uuid,p_dados jsonb,p_rate_key text) returns uuid language plpgsql security invoker set search_path='' as $$
declare v_total integer;
begin
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
 if jsonb_array_length(p_dados->'produtos') not between 1 and 30 then raise exception 'Informe de 1 a 30 produtos ou serviços.'; end if;
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

create function private.revisar_cadastro_rapido(p_id uuid,p_aprovar boolean,p_parecer text default '') returns text language plpgsql security definer set search_path='' as $$
declare v public.cadastros_rapidos; v_empresa text; v_produtos text[];
begin
 if not private.is_admin() then raise exception 'Somente administradores podem analisar cadastros.'; end if;
 select * into v from public.cadastros_rapidos where id=p_id for update;
 if not found or v.status<>'pendente' then raise exception 'Cadastro já analisado ou não encontrado.'; end if;
 if not p_aprovar and length(trim(p_parecer))<5 then raise exception 'Informe o motivo da não aprovação.'; end if;
 if p_aprovar then
  v_empresa:=gen_random_uuid()::text;
  v_produtos:=array(select jsonb_array_elements_text(v.dados->'produtos'));
  insert into public.empreendimentos(id,nome,municipio_codigo,categoria,historia,produtos,telefone,email,instagram,comunidade,responsavel,tipo,aprovado,cor)
  values(v_empresa,trim(v.dados->>'nome'),v.dados->>'municipio_codigo',trim(v.dados->>'categoria'),trim(v.dados->>'historia'),v_produtos,
  left(trim(v.dados->>'telefone'),30),left(trim(coalesce(v.dados->>'email','')),254),left(trim(coalesce(v.dados->>'instagram','')),100),left(trim(coalesce(v.dados->>'comunidade','')),200),left(trim(coalesce(v.dados->>'responsavel','')),160),left(coalesce(v.dados->>'tipo','Empreendedor individual'),80),true,'#256b3d');
  insert into public.publicacoes(empreendimento_id,created_by,titulo,conteudo,produtos,status,reviewed_at,reviewed_by)
  values(v_empresa,auth.uid(),left('Conheça '||trim(v.dados->>'nome'),140),trim(v.dados->>'historia'),v_produtos,'aprovado',now(),auth.uid());
  insert into public.avisos(empreendimento_id,mensagem) values(v_empresa,'O cadastro enviado pela equipe foi aprovado. Seu perfil já está na vitrine.');
 end if;
 update public.cadastros_rapidos set status=case when p_aprovar then 'aprovado' else 'rejeitado' end,parecer=left(nullif(trim(p_parecer),''),1000),empreendimento_id=v_empresa,reviewed_at=now(),reviewed_by=auth.uid() where id=p_id;
 return v_empresa;
end; $$;
revoke all on function private.revisar_cadastro_rapido(uuid,boolean,text) from public;
grant execute on function private.revisar_cadastro_rapido(uuid,boolean,text) to authenticated;
create function public.revisar_cadastro_rapido(p_id uuid,p_aprovar boolean,p_parecer text default '') returns text language sql security invoker set search_path='' as $$ select private.revisar_cadastro_rapido(p_id,p_aprovar,p_parecer); $$;
revoke all on function public.revisar_cadastro_rapido(uuid,boolean,text) from public,anon;
grant execute on function public.revisar_cadastro_rapido(uuid,boolean,text) to authenticated;

create table private.admin_access_log(id uuid primary key default gen_random_uuid(),actor_id uuid not null,usuario_id uuid not null,created_at timestamptz not null default now());
alter table private.admin_access_log enable row level security;
revoke all on private.admin_access_log from public,anon,authenticated;
create function private.adicionar_administrador(p_email text) returns void language plpgsql security definer set search_path='' as $$
declare v_uid uuid;
begin
 if not private.is_admin() then raise exception 'Somente administradores podem liberar este acesso.'; end if;
 select id into v_uid from auth.users where lower(email)=lower(trim(p_email)) and deleted_at is null;
 if v_uid is null then raise exception 'E-mail não encontrado. A pessoa precisa criar uma conta normal primeiro.'; end if;
 if exists(select 1 from public.profiles where id=v_uid and role='admin') then return; end if;
 update public.profiles set role='admin' where id=v_uid;
 if not found then raise exception 'Perfil não encontrado. Solicite que a pessoa entre na conta primeiro.'; end if;
 insert into private.admin_access_log(actor_id,usuario_id) values(auth.uid(),v_uid);
end; $$;
revoke all on function private.adicionar_administrador(text) from public;
grant execute on function private.adicionar_administrador(text) to authenticated;
create function public.adicionar_administrador(p_email text) returns void language sql security invoker set search_path='' as $$select private.adicionar_administrador(p_email);$$;
revoke all on function public.adicionar_administrador(text) from public,anon;
grant execute on function public.adicionar_administrador(text) to authenticated;
create function private.listar_administradores() returns table(id uuid,email text) language plpgsql security definer set search_path='' as $$
begin
 if not private.is_admin() then raise exception 'Acesso administrativo necessário.'; end if;
 return query select u.id,u.email::text from auth.users u join public.profiles p on p.id=u.id where p.role='admin' and u.deleted_at is null order by u.email;
end; $$;
revoke all on function private.listar_administradores() from public;
grant execute on function private.listar_administradores() to authenticated;
create function public.listar_administradores() returns table(id uuid,email text) language sql security invoker set search_path='' as $$select * from private.listar_administradores();$$;
revoke all on function public.listar_administradores() from public,anon;
grant execute on function public.listar_administradores() to authenticated;
