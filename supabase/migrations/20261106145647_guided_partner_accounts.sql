-- Cadastro autenticado, três destinos e atualizações sempre sujeitas à curadoria.
alter table public.cadastros_rapidos add column owner_id uuid references auth.users(id) on delete set null;
alter table public.cadastros_rapidos add column referencia_id uuid references public.cadastros_rapidos(id);
create index cadastros_owner_created on public.cadastros_rapidos(owner_id,created_at desc) where owner_id is not null;
create unique index cadastro_owner_pendente on public.cadastros_rapidos(owner_id) where owner_id is not null and status='pendente';
create policy cadastros_owner_read on public.cadastros_rapidos for select to authenticated using(owner_id=(select auth.uid()));
alter table public.parceiros_observatorio add column incluir_dashboard boolean not null default true;

create table public.rascunhos_parceiros(
 owner_id uuid primary key references auth.users(id) on delete cascade,
 dados jsonb not null default '{}'::jsonb check(jsonb_typeof(dados)='object' and octet_length(dados::text)<=20000),
 updated_at timestamptz not null default now()
);
alter table public.rascunhos_parceiros enable row level security;
revoke all on public.rascunhos_parceiros from public,anon,authenticated;
grant select,insert,update,delete on public.rascunhos_parceiros to authenticated;
grant all on public.rascunhos_parceiros to service_role;
create policy rascunhos_read on public.rascunhos_parceiros for select to authenticated using(owner_id=(select auth.uid()));
create policy rascunhos_insert on public.rascunhos_parceiros for insert to authenticated with check(owner_id=(select auth.uid()));
create policy rascunhos_update on public.rascunhos_parceiros for update to authenticated using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()));
create policy rascunhos_delete on public.rascunhos_parceiros for delete to authenticated using(owner_id=(select auth.uid()));

create function private.enviar_contribuicao(p_id uuid,p_dados jsonb,p_referencia_id uuid default null)
returns uuid language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid(); v public.cadastros_rapidos; destino text; d jsonb;
begin
 if u is null then raise exception 'Entre na sua conta para enviar os dados.'; end if;
 if private.is_admin() then raise exception 'Use o formulário da equipe para cadastrar por uma organização.'; end if;
 perform pg_advisory_xact_lock(hashtextextended('contribuicao:'||u::text,0));
 select * into v from public.cadastros_rapidos where id=p_id;
 if found then
  if v.owner_id is distinct from u then raise exception 'Envio não disponível para esta conta.'; end if;
  return p_id;
 end if;
 if exists(select 1 from public.cadastros_rapidos where owner_id=u and status='pendente') then raise exception 'Você já tem um envio em análise. Aguarde o retorno da equipe no painel.'; end if;
 if p_referencia_id is not null then
  select * into v from public.cadastros_rapidos where id=p_referencia_id and owner_id=u and status='aprovado';
  if not found then raise exception 'Cadastro de referência não disponível para esta conta.'; end if;
  p_referencia_id:=coalesce(v.referencia_id,v.id);
 elsif exists(select 1 from public.cadastros_rapidos where owner_id=u and status='aprovado') then
  raise exception 'Abra Editar dados no painel para atualizar seu cadastro aprovado.';
 end if;
 destino:=p_dados->>'participacao';
 if destino is null or destino not in ('vitrine','dashboard','ambos') then raise exception 'Escolha vitrine, dashboard ou ambos.'; end if;
 d:=(p_dados-'is_demo'-'owner_id'-'referencia_id')||jsonb_build_object('finalidade',case when destino='dashboard' then 'dashboard' else 'vitrine' end,'versao_formulario',3);
 if coalesce(d->>'imagem_path','')<>'' and not exists(select 1 from storage.objects o where o.bucket_id='publicacoes' and o.name=d->>'imagem_path' and (storage.foldername(o.name))[1]=u::text) then raise exception 'Envie uma imagem pela sua própria conta.'; end if;
 -- Reutiliza a validação central e o limite atômico; o identificador agora é a conta.
 perform public.receber_cadastro_rapido(p_id,d,repeat(md5('conta:'||u::text),2));
 update public.cadastros_rapidos set owner_id=u,referencia_id=p_referencia_id where id=p_id;
 delete from public.rascunhos_parceiros where owner_id=u;
 return p_id;
end; $$;
revoke all on function private.enviar_contribuicao(uuid,jsonb,uuid) from public,anon;
grant execute on function private.enviar_contribuicao(uuid,jsonb,uuid) to authenticated;
create function public.enviar_contribuicao(p_id uuid,p_dados jsonb,p_referencia_id uuid default null)
returns uuid language sql security invoker set search_path='' as $$ select private.enviar_contribuicao(p_id,p_dados,p_referencia_id); $$;
revoke all on function public.enviar_contribuicao(uuid,jsonb,uuid) from public,anon;
grant execute on function public.enviar_contribuicao(uuid,jsonb,uuid) to authenticated;

-- O fluxo público da equipe continua compatível; somente envios vinculados usam a nova revisão.
alter function private.revisar_cadastro_rapido(uuid,boolean,text) rename to revisar_cadastro_equipe;
create function private.revisar_cadastro_rapido(p_id uuid,p_aprovar boolean,p_parecer text default '')
returns text language plpgsql security definer set search_path='' as $$
declare v public.cadastros_rapidos; d jsonb; raiz uuid; empresa text; destino text; v_produtos text[]; vitrine boolean; painel boolean;
begin
 if not private.is_admin() then raise exception 'Somente administradores podem analisar cadastros.'; end if;
 select * into v from public.cadastros_rapidos where id=p_id for update;
 if not found or v.status<>'pendente' then raise exception 'Cadastro já analisado ou não encontrado.'; end if;
 if v.owner_id is null then return private.revisar_cadastro_equipe(p_id,p_aprovar,p_parecer); end if;
 if not p_aprovar then
  if length(trim(p_parecer))<5 then raise exception 'Informe o motivo da solicitação de ajustes.'; end if;
  update public.cadastros_rapidos set status='rejeitado',parecer=left(trim(p_parecer),1000),reviewed_at=now(),reviewed_by=auth.uid() where id=p_id;
  return null;
 end if;
 d:=private.validar_dados_parceiro(v.dados);
 destino:=d->>'participacao'; vitrine:=destino in ('vitrine','ambos'); painel:=destino in ('dashboard','ambos');
 if destino is null or destino not in ('vitrine','dashboard','ambos') then raise exception 'Destino do cadastro inválido.'; end if;
 raiz:=coalesce(v.referencia_id,v.id);
 perform pg_advisory_xact_lock(hashtextextended('contribuicao:'||v.owner_id::text,0));
 select e.id into empresa from public.empreendimentos e where e.owner_id=v.owner_id and not e.is_demo for update;
 perform pg_advisory_xact_lock(hashtextextended(lower(trim(d->>'nome'))||':'||(d->>'municipio_codigo'),0));
 if exists(select 1 from public.parceiros_observatorio p where p.id<>raiz and lower(trim(p.nome))=lower(trim(d->>'nome')) and p.municipio_codigo=d->>'municipio_codigo')
 or exists(select 1 from public.empreendimentos e where e.id is distinct from empresa and not e.is_demo and e.aprovado and lower(trim(e.nome))=lower(trim(d->>'nome')) and e.municipio_codigo=d->>'municipio_codigo') then raise exception 'Já existe um parceiro aprovado com este nome e município.'; end if;
 if d->>'possui_cnpj'='sim' then
  perform pg_advisory_xact_lock(hashtextextended('cnpj:'||(d->>'cnpj'),0));
  if exists(select 1 from public.cadastros_rapidos c where c.status='aprovado' and coalesce(c.referencia_id,c.id)<>raiz and regexp_replace(upper(c.dados->>'cnpj'),'[^A-Z0-9]','','g')=d->>'cnpj') then raise exception 'Este CNPJ já tem um cadastro aprovado.'; end if;
 end if;
 v_produtos:=array(select jsonb_array_elements_text(d->'produtos'));
 if vitrine then
  if empresa is null then empresa:=gen_random_uuid()::text;
   insert into public.empreendimentos(id,nome,municipio_codigo,categoria,historia,produtos,telefone,email,instagram,comunidade,responsavel,tipo,aprovado,cor,owner_id)
   values(empresa,trim(d->>'nome'),d->>'municipio_codigo',trim(d->>'categoria'),trim(d->>'historia'),v_produtos,left(trim(d->>'telefone'),30),left(trim(coalesce(d->>'email','')),254),left(trim(coalesce(d->>'instagram','')),100),left(trim(coalesce(d->>'comunidade','')),200),left(trim(coalesce(d->>'responsavel','')),160),d->>'tipo',true,'#166340',v.owner_id);
  else
   update public.empreendimentos set nome=trim(d->>'nome'),municipio_codigo=d->>'municipio_codigo',categoria=trim(d->>'categoria'),historia=trim(d->>'historia'),produtos=v_produtos,telefone=left(trim(d->>'telefone'),30),email=left(trim(coalesce(d->>'email','')),254),instagram=left(trim(coalesce(d->>'instagram','')),100),comunidade=left(trim(coalesce(d->>'comunidade','')),200),responsavel=left(trim(coalesce(d->>'responsavel','')),160),tipo=d->>'tipo',aprovado=true where id=empresa;
  end if;
  if coalesce(d->>'imagem_path','')<>'' and not exists(select 1 from storage.objects o where o.bucket_id='publicacoes' and o.name=d->>'imagem_path' and (storage.foldername(o.name))[1]=v.owner_id::text) then raise exception 'Imagem não pertence a esta conta.'; end if;
  insert into public.publicacoes(empreendimento_id,created_by,titulo,conteudo,produtos,imagem_path,status,reviewed_at,reviewed_by)
  values(empresa,v.owner_id,left(case when v.referencia_id is null then 'Conheça ' else 'Novidades de ' end||trim(d->>'nome'),140),trim(d->>'historia'),v_produtos,nullif(d->>'imagem_path',''),'aprovado',now(),auth.uid());
  update public.profiles set empreendimento_id=empresa where id=v.owner_id;
  insert into public.avisos(empreendimento_id,mensagem) values(empresa,'A ONG aprovou seus dados. Sua apresentação está publicada na vitrine.');
 elsif empresa is not null then
  update public.empreendimentos set aprovado=false where id=empresa;
  insert into public.avisos(empreendimento_id,mensagem) values(empresa,'Sua participação foi atualizada para somente dashboard. O perfil deixou de aparecer na vitrine.');
 end if;
 insert into public.parceiros_observatorio(id,empreendimento_id,nome,municipio_codigo,categoria,tipo,produtos,site,funcionamento,trabalhadores,familias,producao_anual_ton,ano_referencia,aprovado,incluir_dashboard)
 values(raiz,empresa,trim(d->>'nome'),d->>'municipio_codigo',trim(d->>'categoria'),d->>'tipo',v_produtos,coalesce(d->>'site',''),d->>'funcionamento',(d->>'trabalhadores')::integer,(d->>'familias')::integer,(d->>'producao_anual_ton')::numeric,(d->>'ano_referencia')::integer,true,painel)
 on conflict(id) do update set empreendimento_id=excluded.empreendimento_id,nome=excluded.nome,municipio_codigo=excluded.municipio_codigo,categoria=excluded.categoria,tipo=excluded.tipo,produtos=excluded.produtos,site=excluded.site,funcionamento=excluded.funcionamento,trabalhadores=excluded.trabalhadores,familias=excluded.familias,producao_anual_ton=excluded.producao_anual_ton,ano_referencia=excluded.ano_referencia,aprovado=true,incluir_dashboard=excluded.incluir_dashboard;
 update public.cadastros_rapidos set status='aprovado',parecer=left(nullif(trim(p_parecer),''),1000),empreendimento_id=empresa,reviewed_at=now(),reviewed_by=auth.uid() where id=p_id;
 return empresa;
end; $$;
revoke all on function private.revisar_cadastro_rapido(uuid,boolean,text) from public,anon;
grant execute on function private.revisar_cadastro_rapido(uuid,boolean,text) to authenticated;
create or replace function public.revisar_cadastro_rapido(p_id uuid,p_aprovar boolean,p_parecer text default '') returns text language sql security invoker set search_path='' as $$ select private.revisar_cadastro_rapido(p_id,p_aprovar,p_parecer); $$;
revoke all on function public.revisar_cadastro_rapido(uuid,boolean,text) from public,anon;
grant execute on function public.revisar_cadastro_rapido(uuid,boolean,text) to authenticated;

-- Reserva atômica usada exclusivamente pelo servidor do cadastro de acesso.
create function public.reservar_cadastro_acesso(p_rede text,p_email text) returns void
language plpgsql security invoker set search_path='' as $$
declare n integer;
begin
 if length(p_rede)<>64 or length(p_email)<>64 then raise exception 'Solicitação inválida.'; end if;
 insert into private.form_rate_limits(rate_key,hora) values(p_rede,date_trunc('hour',now()))
 on conflict(rate_key,hora) do update set total=private.form_rate_limits.total+1 returning total into n;
 if n>20 then raise exception 'Limite de cadastros atingido. Tente novamente mais tarde.'; end if;
 insert into private.form_rate_limits(rate_key,hora) values(p_email,date_trunc('hour',now()))
 on conflict(rate_key,hora) do update set total=private.form_rate_limits.total+1 returning total into n;
 if n>3 then raise exception 'Limite de tentativas atingido. Use Entrar ou Redefinir senha.'; end if;
end; $$;
revoke all on function public.reservar_cadastro_acesso(text,text) from public,anon,authenticated;
grant execute on function public.reservar_cadastro_acesso(text,text) to service_role;
