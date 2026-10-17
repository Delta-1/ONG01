begin;
-- Temporary users and rows are fully rolled back at the end.
insert into auth.users(id, aud, role, email, raw_user_meta_data) values
 ('a1000000-0000-4000-8000-000000000001','authenticated','authenticated','qa-owner@example.invalid','{"role":"admin"}'),
 ('a1000000-0000-4000-8000-000000000002','authenticated','authenticated','qa-other@example.invalid','{}'),
 ('a1000000-0000-4000-8000-000000000003','authenticated','authenticated','qa-reviewer@example.invalid','{}');
do $$ begin
 if (select role from public.profiles where id='a1000000-0000-4000-8000-000000000001') <> 'empresa' then raise exception 'Metadata allowed escalation'; end if;
end $$;
update public.profiles set role='admin' where id='a1000000-0000-4000-8000-000000000003';
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"a1000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
select public.enviar_publicacao('{"nome":"QA transacional","municipio_codigo":"1200252","categoria":"Agricultura familiar","historia":"Descrição longa para validar o fluxo sem persistir dados de teste.","telefone":"68999990000","consentimento":true}', '{"titulo":"Primeiro post de teste","conteudo":"Conteúdo de teste transacional com informações suficientes.","produtos":["Produto QA"]}');
do $$ declare v_id uuid; begin
 select id into v_id from public.publicacoes where created_by=auth.uid();
 if v_id is null then raise exception 'Owner cannot see pending'; end if;
 begin perform public.revisar_publicacao(v_id,true,'');raise exception 'Owner approved post'; exception when others then if sqlerrm='Owner approved post' then raise; end if; end;
 begin update public.profiles set role='admin' where id=auth.uid();raise exception 'Owner updated role';exception when insufficient_privilege then null;end;
 begin update public.empreendimentos set aprovado=true where owner_id=auth.uid();raise exception 'Owner bypassed moderation';exception when insufficient_privilege then null;end;
end $$;
select set_config('request.jwt.claims','{"sub":"a1000000-0000-4000-8000-000000000002","role":"authenticated"}',true);
do $$ begin
 if exists(select 1 from public.publicacoes where titulo='Primeiro post de teste') then raise exception 'Pending leaked to another account';end if;
 if exists(select 1 from public.avisos where mensagem like 'Publicação recebida%') then raise exception 'Notice leaked';end if;
end $$;
select set_config('request.jwt.claims','{"sub":"a1000000-0000-4000-8000-000000000003","role":"authenticated"}',true);
select public.revisar_publicacao(id,true,'Dados conferidos') from public.publicacoes where titulo='Primeiro post de teste';
select set_config('request.jwt.claims','{"sub":"a1000000-0000-4000-8000-000000000002","role":"authenticated"}',true);
insert into public.publicacao_curtidas(publicacao_id,user_id) select id,auth.uid() from public.publicacoes where titulo='Primeiro post de teste';
do $$ begin
 if (select count(*) from public.publicacao_curtidas where user_id=auth.uid())<>1 then raise exception 'Like failed';end if;
 begin insert into public.publicacao_curtidas(publicacao_id,user_id) select id,auth.uid() from public.publicacoes where titulo='Primeiro post de teste';raise exception 'Duplicate like accepted';exception when unique_violation then null;end;
 if (select total from public.curtidas_publicacao(array(select id from public.publicacoes where titulo='Primeiro post de teste')))<>1 then raise exception 'Like count failed';end if;
end $$;
set local role anon;
select set_config('request.jwt.claims','{"role":"anon"}',true);
do $$ begin
 if (select count(*) from public.publicacoes where titulo='Primeiro post de teste')<>1 then raise exception 'Approved not public';end if;
 if exists(select 1 from public.empreendimentos where is_demo) then raise exception 'Demo data leaked';end if;
 if exists(select 1 from public.profiles) then raise exception 'Private profiles leaked';end if;
end $$;
rollback;
select 'PASS: roles, ownership, pending isolation, moderation, notifications, public visibility, likes, demo exclusion; all test data rolled back' as resultado;
