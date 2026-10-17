begin;
insert into auth.users(id,email,raw_user_meta_data) values
('c3000000-0000-4000-8000-000000000001','qa-quick-normal@example.invalid','{"role":"admin"}'),
('c3000000-0000-4000-8000-000000000002','qa-quick-admin@example.invalid','{}');
do $$begin if (select role from public.profiles where id='c3000000-0000-4000-8000-000000000001')<>'empresa' then raise exception 'Self elevation';end if;end$$;
update public.profiles set role='admin' where id='c3000000-0000-4000-8000-000000000002';
set local role service_role;
select public.receber_cadastro_rapido('c3000000-0000-4000-8000-000000000003','{"nome":"QA cadastro rápido","municipio_codigo":"1200252","categoria":"Agricultura familiar","historia":"Dados temporários para testar o formulário rápido e a aprovação administrativa.","produtos":["Produto QA"],"telefone":"68999990000","preenchido_por":"QA equipe","consentimento":true}',repeat('a',64));
select public.receber_cadastro_rapido('c3000000-0000-4000-8000-000000000003','{}',repeat('a',64));
set local role anon;
select set_config('request.jwt.claims','{"role":"anon"}',true);
do $$begin
 begin perform count(*) from public.cadastros_rapidos;raise exception 'Anon can read';exception when insufficient_privilege then null;end;
 begin perform public.receber_cadastro_rapido(gen_random_uuid(),'{}',repeat('a',64));raise exception 'Anon bypassed endpoint';exception when insufficient_privilege then null;end;
end$$;
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"c3000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
do $$begin
 if exists(select 1 from public.cadastros_rapidos) then raise exception 'Queue leaked to normal user';end if;
 begin perform public.adicionar_administrador('qa-quick-normal@example.invalid');raise exception 'Normal promoted self';exception when others then if sqlerrm='Normal promoted self' then raise;end if;end;
 begin perform * from public.listar_administradores();raise exception 'Admin emails leaked';exception when others then if sqlerrm='Admin emails leaked' then raise;end if;end;
 begin perform public.revisar_cadastro_rapido('c3000000-0000-4000-8000-000000000003',true,'');raise exception 'Normal approved';exception when others then if sqlerrm='Normal approved' then raise;end if;end;
end$$;
select set_config('request.jwt.claims','{"sub":"c3000000-0000-4000-8000-000000000002","role":"authenticated"}',true);
select public.adicionar_administrador('qa-quick-normal@example.invalid');
select public.revisar_cadastro_rapido('c3000000-0000-4000-8000-000000000003',true,'Conferido');
do $$begin
 if not exists(select 1 from public.listar_administradores() where email='qa-quick-normal@example.invalid') then raise exception 'Promotion failed';end if;
 if (select count(*) from public.cadastros_rapidos where id='c3000000-0000-4000-8000-000000000003')<>1 then raise exception 'Duplicate intake';end if;
 if not exists(select 1 from public.empreendimentos where nome='QA cadastro rápido' and aprovado and not is_demo) then raise exception 'Approval failed';end if;
 begin perform public.revisar_cadastro_rapido('c3000000-0000-4000-8000-000000000003',true,'');raise exception 'Duplicate approval';exception when others then if sqlerrm='Duplicate approval' then raise;end if;end;
end$$;
set local role service_role;
insert into private.form_rate_limits(rate_key,hora,total) values(repeat('b',64),date_trunc('hour',now()),60);
do $$begin
 begin perform public.receber_cadastro_rapido('c3000000-0000-4000-8000-000000000004','{"nome":"QA limite teste","municipio_codigo":"1200252","categoria":"Agricultura familiar","historia":"Dados temporários para testar o limite de envios por rede no formulário.","produtos":["Produto QA"],"telefone":"68999990000","preenchido_por":"QA equipe","consentimento":true}',repeat('b',64));raise exception 'Rate limit bypassed';exception when others then if sqlerrm='Rate limit bypassed' then raise;end if;end;
end$$;
rollback;
select 'PASS: public form privacy, idempotency, rate limit, admin-only approval and role promotion; test data rolled back' as resultado;
