begin;
insert into auth.users(id,email,raw_user_meta_data) values('c6000000-0000-4000-8000-000000000001','qa-partner-admin@example.invalid','{}');
update public.profiles set role='admin' where id='c6000000-0000-4000-8000-000000000001';
set local role service_role;
select public.receber_cadastro_rapido('c6000000-0000-4000-8000-000000000002','{"finalidade":"dashboard","tipo":"Associação","funcionamento":"em_atividade","possui_produtos":"nao","possui_cnpj":"sim","cnpj":"11.222.333/0001-81","situacao_cnpj":"ativo","nome":"QA Parceiro sem vitrine","municipio_codigo":"1200252","categoria":"Pesquisa e apoio","historia":"Organização temporária para verificar o cadastro de parceiros sem vitrine.","produtos":[],"telefone":"68999990000","preenchido_por":"Equipe QA","colaboracao":"Compartilhar estudos e dados para o Observatório.","trabalhadores":4,"familias":null,"producao_anual_ton":null,"ano_referencia":2026,"site":"https://example.org","consentimento":true}',repeat('c',64));
select public.receber_cadastro_rapido('c6000000-0000-4000-8000-000000000003','{"finalidade":"vitrine","tipo":"Cooperativa","funcionamento":"em_atividade","possui_produtos":"sim","possui_cnpj":"nao","nome":"QA Parceiro com vitrine","municipio_codigo":"1200252","categoria":"Castanha","historia":"Empreendimento temporário para verificar a vitrine e os indicadores sem duplicação.","produtos":["Castanha"],"telefone":"68999990000","preenchido_por":"Equipe QA","familias":0,"trabalhadores":8,"producao_anual_ton":1.25,"ano_referencia":2026,"consentimento":true}',repeat('c',64));
do $$declare d jsonb; begin
 select dados into d from public.cadastros_rapidos where id='c6000000-0000-4000-8000-000000000002';
 begin perform public.receber_cadastro_rapido(gen_random_uuid(),d||'{"finalidade":"vitrine"}',repeat('c',64)); raise exception 'FAIL: vitrine sem produto';exception when others then if sqlerrm like 'FAIL:%' then raise;end if;end;
 begin perform public.receber_cadastro_rapido(gen_random_uuid(),d||'{"trabalhadores":-1}',repeat('c',64));raise exception 'FAIL: quantidade negativa';exception when others then if sqlerrm like 'FAIL:%' then raise;end if;end;
 begin perform public.receber_cadastro_rapido(gen_random_uuid(),d||'{"ano_referencia":null}',repeat('c',64));raise exception 'FAIL: quantidade sem ano';exception when others then if sqlerrm like 'FAIL:%' then raise;end if;end;
 begin perform public.receber_cadastro_rapido(gen_random_uuid(),d||'{"site":"javascript:alert(1)"}',repeat('c',64));raise exception 'FAIL: site inseguro';exception when others then if sqlerrm like 'FAIL:%' then raise;end if;end;
end$$;
set local role anon;
select set_config('request.jwt.claims','{"role":"anon"}',true);
do $$begin if exists(select 1 from public.parceiros_observatorio where id in ('c6000000-0000-4000-8000-000000000002','c6000000-0000-4000-8000-000000000003')) then raise exception 'FAIL: pendente público';end if; begin perform public.revisar_cadastro_rapido('c6000000-0000-4000-8000-000000000002',true,'');raise exception 'FAIL: aprovação anônima';exception when insufficient_privilege then null;end;end$$;
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"c6000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
select public.revisar_cadastro_rapido('c6000000-0000-4000-8000-000000000002',true,'Conferido');
select public.revisar_cadastro_rapido('c6000000-0000-4000-8000-000000000003',true,'Conferido');
do $$begin
 if exists(select 1 from public.empreendimentos where nome='QA Parceiro sem vitrine') then raise exception 'FAIL: criou vitrine indevida';end if;
 if (select count(*) from public.empreendimentos where nome='QA Parceiro com vitrine' and aprovado)<>1 then raise exception 'FAIL: vitrine não criada';end if;
 if (select count(*) from public.publicacoes where empreendimento_id=(select empreendimento_id from public.cadastros_rapidos where id='c6000000-0000-4000-8000-000000000003') and status='aprovado')<>1 then raise exception 'FAIL: apresentação não publicada';end if;
end$$;
set local role anon;
select set_config('request.jwt.claims','{"role":"anon"}',true);
do $$declare v jsonb; begin
 select to_jsonb(p) into v from public.parceiros_observatorio p where id='c6000000-0000-4000-8000-000000000002';
 if v is null or (v->>'trabalhadores')::int<>4 or v->>'familias' is not null then raise exception 'FAIL: números públicos incorretos';end if;
 if v ? 'cnpj' or v ? 'telefone' or v ? 'preenchido_por' then raise exception 'FAIL: dados administrativos públicos';end if;
 if (select familias from public.parceiros_observatorio where id='c6000000-0000-4000-8000-000000000003')<>0 then raise exception 'FAIL: zero perdido';end if;
 begin update public.parceiros_observatorio set trabalhadores=999 where id='c6000000-0000-4000-8000-000000000002';raise exception 'FAIL: escrita anônima';exception when insufficient_privilege then null;end;
end$$;
rollback;
select 'PASS: finalidades separadas, validação, aprovação, indicadores anônimos sem CNPJ/contatos, zero e ausência distintos; dados revertidos' as resultado;
