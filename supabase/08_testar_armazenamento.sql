-- =====================================================================
-- LexIA — Fase 8: teste de segurança dos ARQUIVOS (Storage)
-- Rode DEPOIS do 07 e do vínculo dos logins (Caio e Marcela).
--
-- O que ele faz: "finge" ser Caio (Administrador da Silva), Marcela (Administradora da
-- Ribeiro & Lima) e Marina (estagiária da Silva) e tenta enviar, ver e excluir arquivos
-- de formas certas e erradas. Mostra ✅ ou ❌ em cada teste.
--
-- Os arquivos de teste são só LINHAS de teste (nome terminando em ...f1.pdf a ...f9.pdf)
-- e são apagados no final. Não mexe nos seus documentos nem nos vínculos dos seus logins.
-- A única coisa temporária é um login de mentira ligado à Marina, desfeito no fim.
-- Se o script parar com erro no meio, rode-o de novo: ele limpa o que sobrou.
-- Se ALGUM teste mostrar ❌, não avance.
-- =====================================================================

-- O Storage impede apagar linhas direto pelo SQL; este aviso libera só para este teste.
select set_config('storage.allow_delete_query', 'true', false);

-- ---------- Limpeza (também roda no início) ----------
reset role;
delete from storage.objects where bucket_id = 'documents' and name like '%-0000000000f_.pdf';
update public.profiles set auth_user_id = null where office_id = 'e9184ec0-1771-b6a1-0bb0-506f9c19dab3' and name = 'Marina Rocha';
delete from auth.users where id = 'aaaaaaaa-0000-0000-0000-0000000000a1';

-- ---------- Preparação ----------
insert into auth.users (id, email) values ('aaaaaaaa-0000-0000-0000-0000000000a1', 'teste-marina-fase8@example.com');
update public.profiles set auth_user_id = 'aaaaaaaa-0000-0000-0000-0000000000a1' where office_id = 'e9184ec0-1771-b6a1-0bb0-506f9c19dab3' and name = 'Marina Rocha';

drop table if exists pg_temp.resultados;
create temp table resultados (ordem serial, teste text, esperado text, obtido text);
grant all on resultados to public;
grant all on resultados_ordem_seq to public;

insert into resultados (teste, esperado, obtido)
  select 'Bucket "documents" é privado', 'sim', case when (select public from storage.buckets where id = 'documents') = false then 'sim' else 'NÃO' end;
insert into resultados (teste, esperado, obtido)
  select 'Caio: login vinculado ao perfil Caio Henrique', 'sim', case when count(auth_user_id) = 1 then 'sim' else 'NÃO' end
  from public.profiles where office_id = 'e9184ec0-1771-b6a1-0bb0-506f9c19dab3' and name = 'Caio Henrique';
insert into resultados (teste, esperado, obtido)
  select 'Marcela: login vinculado ao perfil Marcela Ribeiro', 'sim', case when count(auth_user_id) = 1 then 'sim' else 'NÃO' end
  from public.profiles where office_id = 'cb7a3f10-2d54-4e8b-9a61-7f3d2e1c0b94' and name = 'Marcela Ribeiro';

-- =====================================================================
-- COMO CAIO (ADMINISTRADOR DA SILVA)
-- =====================================================================
reset role;
select set_config('request.jwt.claim.sub', coalesce((select auth_user_id::text from public.profiles where office_id = 'e9184ec0-1771-b6a1-0bb0-506f9c19dab3' and name = 'Caio Henrique'), ''), false);
set role authenticated;
do $$ begin
  insert into storage.objects (bucket_id, name) values ('documents', 'e9184ec0-1771-b6a1-0bb0-506f9c19dab3/' || md5('lexia:proc-1')::uuid::text || '/00000000-0000-4000-8000-0000000000f1.pdf');
  insert into resultados (teste, esperado, obtido) values ('Caio envia arquivo para a pasta do próprio escritório', 'permitido', 'permitido');
exception when others then
  insert into resultados (teste, esperado, obtido) values ('Caio envia arquivo para a pasta do próprio escritório', 'permitido', 'bloqueado');
end $$;
do $$ begin
  insert into storage.objects (bucket_id, name) values ('documents', 'cb7a3f10-2d54-4e8b-9a61-7f3d2e1c0b94/' || md5('lexia:rl:proc-1')::uuid::text || '/00000000-0000-4000-8000-0000000000f2.pdf');
  insert into resultados (teste, esperado, obtido) values ('Caio tenta enviar arquivo para a pasta da Ribeiro & Lima', 'bloqueado', 'PERMITIDO');
exception when others then
  insert into resultados (teste, esperado, obtido) values ('Caio tenta enviar arquivo para a pasta da Ribeiro & Lima', 'bloqueado', 'bloqueado');
end $$;
insert into resultados (teste, esperado, obtido)
  select 'Caio vê o arquivo do próprio escritório', '1', count(*)::text from storage.objects where bucket_id = 'documents' and name like 'e9184ec0-1771-b6a1-0bb0-506f9c19dab3/%-0000000000f1.pdf';

-- =====================================================================
-- COMO MARCELA (ADMINISTRADORA DA RIBEIRO & LIMA)
-- =====================================================================
reset role;
select set_config('request.jwt.claim.sub', coalesce((select auth_user_id::text from public.profiles where office_id = 'cb7a3f10-2d54-4e8b-9a61-7f3d2e1c0b94' and name = 'Marcela Ribeiro'), ''), false);
set role authenticated;
insert into resultados (teste, esperado, obtido)
  select 'Marcela vê arquivos do escritório Silva', '0', count(*)::text from storage.objects where bucket_id = 'documents' and name like 'e9184ec0-1771-b6a1-0bb0-506f9c19dab3/%';
do $$ begin
  insert into storage.objects (bucket_id, name) values ('documents', 'cb7a3f10-2d54-4e8b-9a61-7f3d2e1c0b94/' || md5('lexia:rl:proc-1')::uuid::text || '/00000000-0000-4000-8000-0000000000f3.pdf');
  insert into resultados (teste, esperado, obtido) values ('Marcela envia arquivo para a pasta do próprio escritório', 'permitido', 'permitido');
exception when others then
  insert into resultados (teste, esperado, obtido) values ('Marcela envia arquivo para a pasta do próprio escritório', 'permitido', 'bloqueado');
end $$;
do $$ begin
  insert into storage.objects (bucket_id, name) values ('documents', 'e9184ec0-1771-b6a1-0bb0-506f9c19dab3/' || md5('lexia:proc-1')::uuid::text || '/00000000-0000-4000-8000-0000000000f4.pdf');
  insert into resultados (teste, esperado, obtido) values ('Marcela tenta enviar arquivo para a pasta da Silva', 'bloqueado', 'PERMITIDO');
exception when others then
  insert into resultados (teste, esperado, obtido) values ('Marcela tenta enviar arquivo para a pasta da Silva', 'bloqueado', 'bloqueado');
end $$;
with d as (delete from storage.objects where bucket_id = 'documents' and name like 'e9184ec0-1771-b6a1-0bb0-506f9c19dab3/%-0000000000f1.pdf' returning 1)
  insert into resultados (teste, esperado, obtido) select 'Marcela tenta EXCLUIR arquivo da Silva (linhas afetadas)', '0', count(*)::text from d;

-- =====================================================================
-- COMO MARINA (ESTAGIÁRIA DA SILVA)
-- =====================================================================
reset role;
select set_config('request.jwt.claim.sub', 'aaaaaaaa-0000-0000-0000-0000000000a1', false);
set role authenticated;
do $$ begin
  insert into storage.objects (bucket_id, name) values ('documents', 'e9184ec0-1771-b6a1-0bb0-506f9c19dab3/' || md5('lexia:proc-1')::uuid::text || '/00000000-0000-4000-8000-0000000000f5.pdf');
  insert into resultados (teste, esperado, obtido) values ('Marina (estagiária) envia arquivo para a pasta do próprio escritório', 'permitido', 'permitido');
exception when others then
  insert into resultados (teste, esperado, obtido) values ('Marina (estagiária) envia arquivo para a pasta do próprio escritório', 'permitido', 'bloqueado');
end $$;
insert into resultados (teste, esperado, obtido)
  select 'Marina (estagiária) vê arquivos do próprio escritório (f1 e f5)', '2', count(*)::text from storage.objects where bucket_id = 'documents' and name like 'e9184ec0-1771-b6a1-0bb0-506f9c19dab3/%' and (name like '%-0000000000f1.pdf' or name like '%-0000000000f5.pdf');
with d as (delete from storage.objects where bucket_id = 'documents' and name like 'e9184ec0-1771-b6a1-0bb0-506f9c19dab3/%-0000000000f5.pdf' returning 1)
  insert into resultados (teste, esperado, obtido) select 'Marina (estagiária) tenta EXCLUIR arquivo (linhas afetadas)', '0', count(*)::text from d;

-- =====================================================================
-- COMO CAIO (DE NOVO, PARA EXCLUIR)
-- =====================================================================
reset role;
select set_config('request.jwt.claim.sub', coalesce((select auth_user_id::text from public.profiles where office_id = 'e9184ec0-1771-b6a1-0bb0-506f9c19dab3' and name = 'Caio Henrique'), ''), false);
set role authenticated;
with d as (delete from storage.objects where bucket_id = 'documents' and name like 'e9184ec0-1771-b6a1-0bb0-506f9c19dab3/%-0000000000f5.pdf' returning 1)
  insert into resultados (teste, esperado, obtido) select 'Caio exclui arquivo do próprio escritório (linhas afetadas)', '1', count(*)::text from d;
with d as (delete from storage.objects where bucket_id = 'documents' and name like 'cb7a3f10-2d54-4e8b-9a61-7f3d2e1c0b94/%-0000000000f3.pdf' returning 1)
  insert into resultados (teste, esperado, obtido) select 'Caio tenta EXCLUIR arquivo da Ribeiro & Lima (linhas afetadas)', '0', count(*)::text from d;

-- =====================================================================
-- VISITANTE SEM LOGIN
-- =====================================================================
reset role;
select set_config('request.jwt.claim.sub', '', false);
set role anon;

do $$ declare n bigint; begin
  select count(*) into n from storage.objects where bucket_id = 'documents';
  insert into resultados (teste, esperado, obtido) values ('Visitante sem login vê arquivos', '0', n::text);
exception when others then
  insert into resultados (teste, esperado, obtido) values ('Visitante sem login vê arquivos', '0', '0');
end $$;

-- =====================================================================
-- Limpeza e resultado
-- =====================================================================
reset role;

delete from storage.objects where bucket_id = 'documents' and name like '%-0000000000f_.pdf';
update public.profiles set auth_user_id = null where office_id = 'e9184ec0-1771-b6a1-0bb0-506f9c19dab3' and name = 'Marina Rocha';
delete from auth.users where id = 'aaaaaaaa-0000-0000-0000-0000000000a1';
select set_config('storage.allow_delete_query', 'false', false);

insert into resultados (teste, esperado, obtido)
  select 'Limpeza: arquivos de teste que sobraram', '0', count(*)::text
  from storage.objects where bucket_id = 'documents' and name like '%-0000000000f_.pdf';

select
  teste,
  esperado,
  obtido,
  case when esperado = obtido then '✅ OK' else '❌ FALHOU' end as resultado
from resultados
order by ordem;
