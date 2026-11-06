-- Valida o número declarado; não consulta situação cadastral na Receita Federal.
-- Algoritmo da Receita e Serpro para CNPJ numérico e alfanumérico:
-- https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/documentos-tecnicos/cnpj/manual-dv-cnpj.pdf
create function private.cnpj_valido(cnpj text) returns boolean
language plpgsql immutable security invoker set search_path='' as $$
declare s text:=regexp_replace(upper(coalesce(cnpj,'')),'[./[:space:]-]','','g'); parcial text; soma integer; resto integer; dv integer; etapa integer; i integer;
begin
 if s !~ '^[A-Z0-9]{12}[0-9]{2}$' or s ~ '^([0-9])\1{13}$' then return false; end if;
 parcial:=left(s,12);
 for etapa in 1..2 loop
  soma:=0;
  for i in 1..length(parcial) loop
   soma:=soma+(ascii(substr(parcial,i,1))-48)*(2+((length(parcial)-i)%8));
  end loop;
  resto:=soma%11; dv:=case when resto<2 then 0 else 11-resto end;
  parcial:=parcial||dv::text;
 end loop;
 return parcial=s;
end; $$;
revoke all on function private.cnpj_valido(text) from public,anon,authenticated;
grant execute on function private.cnpj_valido(text) to service_role;

create or replace function private.validar_dados_parceiro(d jsonb) returns jsonb language plpgsql security invoker set search_path='' as $$
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
  if not private.cnpj_valido(v_cnpj) then raise exception 'CNPJ com dígitos verificadores inválidos. Confira o documento ou selecione Não sei informar.'; end if;
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
