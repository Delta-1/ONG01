-- Preserve demo records, but exclude them from public data and new workflows.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated, service_role;
alter table public.empreendimentos add column if not exists owner_id uuid references auth.users(id) on delete set null;
alter table public.empreendimentos add column if not exists is_demo boolean not null default false;
alter table public.empreendimentos add column if not exists comunidade text not null default '';
alter table public.empreendimentos add column if not exists responsavel text not null default '';
alter table public.empreendimentos add column if not exists tipo text not null default 'Empreendedor individual';
update public.empreendimentos set is_demo=true where id in ('coop-castanha-xapuri','sabores-do-jurua','latex-nativa','mel-da-mata','pirarucu-manejado','oleos-da-floresta','artesanato-huni-kuin','farinha-de-cruzeiro','87701bc8-0b74-4508-ab19-e0e999535e8b');
create unique index if not exists empreendimentos_one_owner on public.empreendimentos(owner_id) where owner_id is not null;
create index if not exists empreendimentos_municipio_real on public.empreendimentos(municipio_codigo) where not is_demo;
alter table public.noticias add column if not exists is_demo boolean not null default false;
alter table public.legislacao add column if not exists is_demo boolean not null default false;
alter table public.indicadores_municipio add column if not exists is_demo boolean not null default false;
update public.noticias set is_demo=true where id in ('n1','n2','n3','n4');
update public.legislacao set is_demo=true where id in ('l1','l2','l3','l4');
update public.indicadores_municipio set is_demo=true;

create or replace function private.is_admin() returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(select 1 from public.profiles where id=auth.uid() and role='admin');
$$;
revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to anon,authenticated,service_role;
create or replace function public.is_admin() returns boolean language sql stable security invoker set search_path='' as $$ select private.is_admin(); $$;
-- New accounts cannot choose administrative privileges through editable metadata.
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path='' as $$
begin insert into public.profiles(id,role) values(new.id,'empresa') on conflict(id) do nothing; return new; end; $$;
revoke all on function public.handle_new_user() from public,anon,authenticated;
-- All profile writes and ownership changes happen in checked server operations.
drop policy if exists profiles_update_own on public.profiles;
revoke insert,update,delete on public.profiles from anon,authenticated;

do $$ declare p record; begin
 for p in select policyname from pg_policies where schemaname='public' and tablename in ('empreendimentos','noticias','legislacao','indicadores_municipio') loop
 execute format('drop policy %I on public.%I',p.policyname,(select tablename from pg_policies where schemaname='public' and policyname=p.policyname limit 1));
 end loop;
end $$;
create policy empreendimentos_read on public.empreendimentos for select to anon,authenticated using ((not is_demo and aprovado) or owner_id=auth.uid() or private.is_admin());
create policy noticias_real on public.noticias for select to anon,authenticated using(not is_demo or private.is_admin());
create policy legislacao_real on public.legislacao for select to anon,authenticated using(not is_demo or private.is_admin());
create policy indicadores_real on public.indicadores_municipio for select to anon,authenticated using(not is_demo or private.is_admin());
-- No direct browser writes to company identities or moderation flags.
revoke insert,update,delete on public.empreendimentos from anon,authenticated;

create table public.publicacoes (
 id uuid primary key default gen_random_uuid(),
 empreendimento_id text not null references public.empreendimentos(id),
 created_by uuid not null references auth.users(id),
 titulo text not null check(char_length(trim(titulo)) between 5 and 140),
 conteudo text not null check(char_length(trim(conteudo)) between 30 and 6000),
 processo text not null default '' check(char_length(processo)<=3000),
 impacto text not null default '' check(char_length(impacto)<=3000),
 produtos text[] not null default '{}',
 imagem_path text,
 status text not null default 'pendente' check(status in ('pendente','aprovado','rejeitado')),
 parecer text check(char_length(parecer)<=1000),
 consentimento_em timestamptz not null default now(),
 created_at timestamptz not null default now(),
 reviewed_at timestamptz,
 reviewed_by uuid references auth.users(id)
);
create index publicacoes_empresa on public.publicacoes(empreendimento_id,created_at desc);
create index publicacoes_status on public.publicacoes(status,created_at desc);
alter table public.publicacoes enable row level security;
create policy publicacoes_read on public.publicacoes for select to anon,authenticated using (
 private.is_admin() or exists(select 1 from public.empreendimentos e where e.id=empreendimento_id and (e.owner_id=auth.uid() or (not e.is_demo and e.aprovado and status='aprovado')))
);
grant select on public.publicacoes to anon,authenticated;
revoke insert,update,delete on public.publicacoes from anon,authenticated;

create table public.avisos (
 id uuid primary key default gen_random_uuid(), empreendimento_id text not null references public.empreendimentos(id),
 mensagem text not null, created_at timestamptz not null default now()
);
create index avisos_empresa on public.avisos(empreendimento_id,created_at desc);
alter table public.avisos enable row level security;
create policy avisos_owner on public.avisos for select to authenticated using(private.is_admin() or exists(select 1 from public.empreendimentos e where e.id=empreendimento_id and e.owner_id=auth.uid()));
grant select on public.avisos to authenticated;

create table public.publicacao_curtidas (
 publicacao_id uuid not null references public.publicacoes(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 created_at timestamptz not null default now(), primary key(publicacao_id,user_id)
);
create index publicacao_curtidas_user on public.publicacao_curtidas(user_id);
alter table public.publicacao_curtidas enable row level security;
create policy curtidas_post_select on public.publicacao_curtidas for select to authenticated using(user_id=auth.uid());
create policy curtidas_post_insert on public.publicacao_curtidas for insert to authenticated with check(user_id=auth.uid() and exists(select 1 from public.publicacoes p where p.id=publicacao_id and p.status='aprovado'));
create policy curtidas_post_delete on public.publicacao_curtidas for delete to authenticated using(user_id=auth.uid());
grant select,insert,delete on public.publicacao_curtidas to authenticated;

create or replace function private.enviar_publicacao(p_empresa jsonb,p_post jsonb,p_empresa_id text default null) returns jsonb language plpgsql security definer set search_path='' as $$
declare v_uid uuid:=auth.uid(); v_empresa public.empreendimentos; v_id uuid; v_admin boolean:=private.is_admin(); v_cat text;
begin
 if v_uid is null then raise exception 'Entre na sua conta para publicar.'; end if;
 if coalesce(p_empresa->>'consentimento','false') <> 'true' then raise exception 'Autorize a divulgação das informações enviadas.'; end if;
 if jsonb_array_length(coalesce(p_post->'produtos','[]')) not between 1 and 30 then raise exception 'Informe de 1 a 30 produtos ou serviços.'; end if;
 -- Serialize submissions from the same account to prevent duplicate initial companies.
 perform pg_advisory_xact_lock(hashtextextended(v_uid::text,0));
 if p_empresa_id is not null then
  select * into v_empresa from public.empreendimentos where id=p_empresa_id for update;
  if not found or v_empresa.is_demo or (not v_admin and v_empresa.owner_id is distinct from v_uid) then raise exception 'Empreendimento não disponível para esta conta.'; end if;
 elsif not v_admin then
  select * into v_empresa from public.empreendimentos where owner_id=v_uid for update;
 end if;
 if v_empresa.id is null then
  if length(trim(coalesce(p_empresa->>'nome',''))) not between 3 and 160 then raise exception 'Informe o nome do empreendimento (3 a 160 caracteres).'; end if;
  if not exists(select 1 from public.municipios where codigo=p_empresa->>'municipio_codigo') then raise exception 'Selecione um município do Acre.'; end if;
  v_cat:=trim(coalesce(p_empresa->>'categoria',''));
  if length(v_cat) not between 3 and 120 then raise exception 'Informe a categoria do negócio.'; end if;
  if length(trim(coalesce(p_empresa->>'historia',''))) not between 30 and 4000 then raise exception 'Conte a história do empreendimento (30 a 4000 caracteres).'; end if;
  if length(trim(coalesce(p_empresa->>'telefone',''))) not between 8 and 30 then raise exception 'Informe um telefone de contato.'; end if;
  if coalesce(p_empresa->>'consentimento','false') <> 'true' then raise exception 'Autorize a divulgação das informações e imagens enviadas.'; end if;
  insert into public.empreendimentos(id,nome,municipio_codigo,categoria,historia,produtos,telefone,email,instagram,cor,owner_id,comunidade,responsavel,tipo)
  values(gen_random_uuid()::text,trim(p_empresa->>'nome'),p_empresa->>'municipio_codigo',v_cat,trim(p_empresa->>'historia'),array(select jsonb_array_elements_text(coalesce(p_empresa->'produtos','[]'))),
   left(trim(p_empresa->>'telefone'),30),left(trim(coalesce(p_empresa->>'email','')),254),left(trim(coalesce(p_empresa->>'instagram','')),100),'#256b3d',case when v_admin then null else v_uid end,
   left(trim(coalesce(p_empresa->>'comunidade','')),200),left(trim(coalesce(p_empresa->>'responsavel','')),160),left(coalesce(p_empresa->>'tipo','Empreendedor individual'),80)) returning * into v_empresa;
  if not v_admin then update public.profiles set empreendimento_id=v_empresa.id where id=v_uid; end if;
 end if;
 if coalesce(p_post->>'imagem_path','')<>'' and not exists(select 1 from storage.objects o where o.bucket_id='publicacoes' and o.name=p_post->>'imagem_path' and (storage.foldername(o.name))[1]=v_uid::text) then raise exception 'Envie uma imagem pela sua própria conta.'; end if;
 insert into public.publicacoes(empreendimento_id,created_by,titulo,conteudo,processo,impacto,produtos,imagem_path)
 values(v_empresa.id,v_uid,trim(p_post->>'titulo'),trim(p_post->>'conteudo'),trim(coalesce(p_post->>'processo','')),trim(coalesce(p_post->>'impacto','')),
 array(select jsonb_array_elements_text(coalesce(p_post->'produtos','[]'))),nullif(p_post->>'imagem_path','')) returning id into v_id;
 insert into public.avisos(empreendimento_id,mensagem) values(v_empresa.id,'Publicação recebida. Você receberá um aviso neste painel quando a equipe concluir a análise.');
 return jsonb_build_object('empreendimento_id',v_empresa.id,'publicacao_id',v_id);
end; $$;
revoke all on function private.enviar_publicacao(jsonb,jsonb,text) from public;
grant execute on function private.enviar_publicacao(jsonb,jsonb,text) to authenticated;
create function public.enviar_publicacao(p_empresa jsonb,p_post jsonb,p_empresa_id text default null) returns jsonb language sql security invoker set search_path='' as $$ select private.enviar_publicacao(p_empresa,p_post,p_empresa_id); $$;
revoke all on function public.enviar_publicacao(jsonb,jsonb,text) from public,anon;
grant execute on function public.enviar_publicacao(jsonb,jsonb,text) to authenticated;

create function private.revisar_publicacao(p_id uuid,p_aprovar boolean,p_parecer text default '') returns void language plpgsql security definer set search_path='' as $$
declare v_post public.publicacoes;
begin
 if not private.is_admin() then raise exception 'Apenas administradores podem revisar publicações.'; end if;
 select * into v_post from public.publicacoes where id=p_id for update;
 if not found then raise exception 'Publicação não encontrada.'; end if;
 if v_post.status<>'pendente' then raise exception 'Esta publicação já foi analisada. Atualize a lista.'; end if;
 if not p_aprovar and length(trim(p_parecer))<5 then raise exception 'Explique o que precisa ser ajustado.'; end if;
 update public.publicacoes set status=case when p_aprovar then 'aprovado' else 'rejeitado' end,parecer=nullif(trim(p_parecer),''),reviewed_at=now(),reviewed_by=auth.uid() where id=p_id;
 if p_aprovar then update public.empreendimentos set aprovado=true where id=v_post.empreendimento_id and not is_demo; end if;
 insert into public.avisos(empreendimento_id,mensagem) values(v_post.empreendimento_id,case when p_aprovar then 'Sua publicação “'||v_post.titulo||'” foi aprovada e já está no seu perfil público.' else 'Sua publicação “'||v_post.titulo||'” precisa de ajustes: '||trim(p_parecer) end);
end; $$;
revoke all on function private.revisar_publicacao(uuid,boolean,text) from public;
grant execute on function private.revisar_publicacao(uuid,boolean,text) to authenticated;
create function public.revisar_publicacao(p_id uuid,p_aprovar boolean,p_parecer text default '') returns void language sql security invoker set search_path='' as $$ select private.revisar_publicacao(p_id,p_aprovar,p_parecer); $$;
revoke all on function public.revisar_publicacao(uuid,boolean,text) from public,anon;
grant execute on function public.revisar_publicacao(uuid,boolean,text) to authenticated;

create function private.curtidas_publicacao(p_ids uuid[]) returns table(publicacao_id uuid,total bigint,curtido boolean) language sql stable security definer set search_path='' as $$
 select p.id,count(c.user_id),coalesce(bool_or(c.user_id=auth.uid()),false)
 from public.publicacoes p join public.empreendimentos e on e.id=p.empreendimento_id
 left join public.publicacao_curtidas c on c.publicacao_id=p.id
 where p.id=any(p_ids) and ((p.status='aprovado' and e.aprovado and not e.is_demo) or e.owner_id=auth.uid() or private.is_admin()) group by p.id;
$$;
revoke all on function private.curtidas_publicacao(uuid[]) from public;
grant execute on function private.curtidas_publicacao(uuid[]) to anon,authenticated;
create function public.curtidas_publicacao(p_ids uuid[]) returns table(publicacao_id uuid,total bigint,curtido boolean) language sql stable security invoker set search_path='' as $$ select * from private.curtidas_publicacao(p_ids); $$;
grant execute on function public.curtidas_publicacao(uuid[]) to anon,authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('publicacoes','publicacoes',false,5242880,array['image/jpeg','image/png','image/webp']) on conflict(id) do nothing;
create policy publicacoes_upload on storage.objects for insert to authenticated with check(bucket_id='publicacoes' and (storage.foldername(name))[1]=auth.uid()::text);
create policy publicacoes_images_read on storage.objects for select to anon,authenticated using(bucket_id='publicacoes' and ((storage.foldername(name))[1]=auth.uid()::text or private.is_admin() or exists(select 1 from public.publicacoes p where p.imagem_path=name and p.status='aprovado')));
create policy publicacoes_images_delete on storage.objects for delete to authenticated using(bucket_id='publicacoes' and (storage.foldername(name))[1]=auth.uid()::text and not exists(select 1 from public.publicacoes p where p.imagem_path=name));
-- Secure existing metric RPCs without removing compatibility.
alter function public.get_curtidas_serie(text) set search_path='';
alter function public.get_views_serie(text) set search_path='';
alter function public.get_metricas_admin() set search_path='';
revoke execute on function public.get_metricas_admin() from public,anon,authenticated;
revoke execute on function public.get_curtidas_serie(text) from public,anon,authenticated;
revoke execute on function public.get_views_serie(text) from public,anon,authenticated;
-- Service-only, atomic ownership assignment. Never exposed to browser roles.
create function public.admin_vincular_acesso(p_empresa text,p_usuario uuid) returns void language plpgsql security invoker set search_path='' as $$
begin
 if not exists(select 1 from public.profiles where id=p_usuario and role='empresa') then raise exception 'Conta de empreendedor necessária.'; end if;
 update public.empreendimentos set owner_id=p_usuario where id=p_empresa and not is_demo and (owner_id is null or owner_id=p_usuario);
 if not found then raise exception 'O empreendimento já tem outro responsável.'; end if;
 update public.profiles set empreendimento_id=p_empresa where id=p_usuario;
end; $$;
revoke all on function public.admin_vincular_acesso(text,uuid) from public,anon,authenticated;
grant execute on function public.admin_vincular_acesso(text,uuid) to service_role;

-- Old anonymous like endpoints are replaced by authenticated per-post likes.
revoke insert,update,delete on public.curtidas from anon,authenticated;
