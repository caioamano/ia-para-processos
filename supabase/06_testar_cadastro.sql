-- =====================================================================
-- LexIA — Fase 7: teste de segurança do CADASTRO de processos (escrita)
-- Rode DEPOIS do 01, 02, 04 e do vínculo dos logins (Caio e Marcela).
--
-- O que ele faz: "finge" ser Caio (Administrador da Silva), Marcela (Administradora da
-- Ribeiro & Lima) e Marina (estagiária da Silva) e tenta cadastrar processos de formas
-- certas e erradas. Mostra ✅ ou ❌ em cada teste.
--
-- Os processos de teste têm o cliente "TESTE-CADASTRO" e são APAGADOS no final.
-- Não mexe nos seus dados nem nos vínculos dos seus logins. A única coisa temporária é
-- um login de mentira ligado à Marina (estagiária que ninguém usa), desfeito no fim.
-- Se o script parar com erro no meio, rode-o de novo: ele limpa o que sobrou.
-- Se ALGUM teste mostrar ❌, não avance.
-- =====================================================================

-- ---------- Limpeza (também roda no início, caso uma execução anterior tenha parado) ----------
reset role;
delete from public.processes where client = 'TESTE-CADASTRO';
update public.profiles set auth_user_id = null where office_id = 'e9184ec0-1771-b6a1-0bb0-506f9c19dab3' and name = 'Marina Rocha';
delete from auth.users where id = 'aaaaaaaa-0000-0000-0000-0000000000a1';

-- ---------- Preparação ----------
insert into auth.users (id, email) values ('aaaaaaaa-0000-0000-0000-0000000000a1', 'teste-marina-fase7@example.com');
update public.profiles set auth_user_id = 'aaaaaaaa-0000-0000-0000-0000000000a1' where office_id = 'e9184ec0-1771-b6a1-0bb0-506f9c19dab3' and name = 'Marina Rocha';

drop table if exists pg_temp.resultados;
create temp table resultados (ordem serial, teste text, esperado text, obtido text);
grant all on resultados to public;
grant all on resultados_ordem_seq to public;

insert into resultados (teste, esperado, obtido)
  select 'Caio: login vinculado ao perfil Caio Henrique', 'sim', case when count(auth_user_id) = 1 then 'sim' else 'NÃO' end
  from public.profiles where office_id = 'e9184ec0-1771-b6a1-0bb0-506f9c19dab3' and name = 'Caio Henrique';
insert into resultados (teste, esperado, obtido)
  select 'Marcela: login vinculado ao perfil Marcela Ribeiro', 'sim', case when count(auth_user_id) = 1 then 'sim' else 'NÃO' end
  from public.profiles where office_id = 'cb7a3f10-2d54-4e8b-9a61-7f3d2e1c0b94' and name = 'Marcela Ribeiro';

-- =====================================================================
-- COMO CAIO (Administrador da Silva)
-- =====================================================================
reset role;
select set_config('request.jwt.claim.sub', coalesce((select auth_user_id::text from public.profiles where office_id = 'e9184ec0-1771-b6a1-0bb0-506f9c19dab3' and name = 'Caio Henrique'), ''), false);
set role authenticated;

do $$ begin
  insert into public.processes (office_id, number, client, type, status, responsible_id) values ('e9184ec0-1771-b6a1-0bb0-506f9c19dab3', '9999999-99.2026.8.16.9901', 'TESTE-CADASTRO', 'Cível', 'Em andamento', (select id from public.profiles where office_id = 'e9184ec0-1771-b6a1-0bb0-506f9c19dab3' and name = 'Caio Henrique'));
  insert into resultados (teste, esperado, obtido) values ('Caio cadastra processo no próprio escritório', 'permitido', 'permitido');
exception when others then
  insert into resultados (teste, esperado, obtido) values ('Caio cadastra processo no próprio escritório', 'permitido', 'bloqueado');
end $$;
do $$ begin
  insert into public.processes (office_id, number, client, type, status, responsible_id) values ('e9184ec0-1771-b6a1-0bb0-506f9c19dab3', '0001234-56.2026.8.16.0001', 'TESTE-CADASTRO', 'Cível', 'Em andamento', (select id from public.profiles where office_id = 'e9184ec0-1771-b6a1-0bb0-506f9c19dab3' and name = 'Caio Henrique'));
  insert into resultados (teste, esperado, obtido) values ('Caio tenta repetir um número que já existe no próprio escritório', 'bloqueado', 'PERMITIDO');
exception when others then
  insert into resultados (teste, esperado, obtido) values ('Caio tenta repetir um número que já existe no próprio escritório', 'bloqueado', 'bloqueado');
end $$;
do $$ begin
  insert into public.processes (office_id, number, client, type, status, responsible_id) values ('e9184ec0-1771-b6a1-0bb0-506f9c19dab3', '0102030-41.2026.8.16.0021', 'TESTE-CADASTRO', 'Cível', 'Em andamento', (select id from public.profiles where office_id = 'e9184ec0-1771-b6a1-0bb0-506f9c19dab3' and name = 'Caio Henrique'));
  insert into resultados (teste, esperado, obtido) values ('Caio usa um número que só existe no outro escritório (permitido: cada escritório tem a sua numeração)', 'permitido', 'permitido');
exception when others then
  insert into resultados (teste, esperado, obtido) values ('Caio usa um número que só existe no outro escritório (permitido: cada escritório tem a sua numeração)', 'permitido', 'bloqueado');
end $$;
do $$ begin
  insert into public.processes (office_id, number, client, type, status, responsible_id) values ('cb7a3f10-2d54-4e8b-9a61-7f3d2e1c0b94', '9999999-99.2026.8.16.9902', 'TESTE-CADASTRO', 'Cível', 'Em andamento', md5('lexia:rl:profile:user-marcela')::uuid);
  insert into resultados (teste, esperado, obtido) values ('Caio tenta cadastrar processo DENTRO da Ribeiro & Lima', 'bloqueado', 'PERMITIDO');
exception when others then
  insert into resultados (teste, esperado, obtido) values ('Caio tenta cadastrar processo DENTRO da Ribeiro & Lima', 'bloqueado', 'bloqueado');
end $$;
do $$ begin
  insert into public.processes (office_id, number, client, type, status, responsible_id) values ('e9184ec0-1771-b6a1-0bb0-506f9c19dab3', '9999999-99.2026.8.16.9903', 'TESTE-CADASTRO', 'Cível', 'Em andamento', md5('lexia:rl:profile:user-marcela')::uuid);
  insert into resultados (teste, esperado, obtido) values ('Caio tenta indicar como responsável alguém da Ribeiro & Lima', 'bloqueado', 'PERMITIDO');
exception when others then
  insert into resultados (teste, esperado, obtido) values ('Caio tenta indicar como responsável alguém da Ribeiro & Lima', 'bloqueado', 'bloqueado');
end $$;
do $$ begin
  insert into public.processes (office_id, number, client, type, status, responsible_id) values ('e9184ec0-1771-b6a1-0bb0-506f9c19dab3', '9999999-99.2026.8.16.9904', 'TESTE-CADASTRO', 'Penal', 'Em andamento', (select id from public.profiles where office_id = 'e9184ec0-1771-b6a1-0bb0-506f9c19dab3' and name = 'Caio Henrique'));
  insert into resultados (teste, esperado, obtido) values ('Caio tenta cadastrar com tipo inválido', 'bloqueado', 'PERMITIDO');
exception when others then
  insert into resultados (teste, esperado, obtido) values ('Caio tenta cadastrar com tipo inválido', 'bloqueado', 'bloqueado');
end $$;

-- =====================================================================
-- COMO MARCELA (Administradora da Ribeiro & Lima)
-- =====================================================================
reset role;
select set_config('request.jwt.claim.sub', coalesce((select auth_user_id::text from public.profiles where office_id = 'cb7a3f10-2d54-4e8b-9a61-7f3d2e1c0b94' and name = 'Marcela Ribeiro'), ''), false);
set role authenticated;

do $$ begin
  insert into public.processes (office_id, number, client, type, status, responsible_id) values ('cb7a3f10-2d54-4e8b-9a61-7f3d2e1c0b94', '9999999-99.2026.8.16.9911', 'TESTE-CADASTRO', 'Cível', 'Em andamento', md5('lexia:rl:profile:user-marcela')::uuid);
  insert into resultados (teste, esperado, obtido) values ('Marcela cadastra processo no próprio escritório', 'permitido', 'permitido');
exception when others then
  insert into resultados (teste, esperado, obtido) values ('Marcela cadastra processo no próprio escritório', 'permitido', 'bloqueado');
end $$;
do $$ begin
  insert into public.processes (office_id, number, client, type, status, responsible_id) values ('e9184ec0-1771-b6a1-0bb0-506f9c19dab3', '9999999-99.2026.8.16.9912', 'TESTE-CADASTRO', 'Cível', 'Em andamento', (select id from public.profiles where office_id = 'e9184ec0-1771-b6a1-0bb0-506f9c19dab3' and name = 'Caio Henrique'));
  insert into resultados (teste, esperado, obtido) values ('Marcela tenta cadastrar processo DENTRO da Silva', 'bloqueado', 'PERMITIDO');
exception when others then
  insert into resultados (teste, esperado, obtido) values ('Marcela tenta cadastrar processo DENTRO da Silva', 'bloqueado', 'bloqueado');
end $$;

-- =====================================================================
-- COMO MARINA (Estagiária da Silva)
-- =====================================================================
reset role;
select set_config('request.jwt.claim.sub', 'aaaaaaaa-0000-0000-0000-0000000000a1', false);
set role authenticated;

do $$ begin
  insert into public.processes (office_id, number, client, type, status, responsible_id) values ('e9184ec0-1771-b6a1-0bb0-506f9c19dab3', '9999999-99.2026.8.16.9921', 'TESTE-CADASTRO', 'Cível', 'Em andamento', (select id from public.profiles where office_id = 'e9184ec0-1771-b6a1-0bb0-506f9c19dab3' and name = 'Marina Rocha'));
  insert into resultados (teste, esperado, obtido) values ('Marina (estagiária) tenta cadastrar processo', 'bloqueado', 'PERMITIDO');
exception when others then
  insert into resultados (teste, esperado, obtido) values ('Marina (estagiária) tenta cadastrar processo', 'bloqueado', 'bloqueado');
end $$;

-- =====================================================================
-- Conferência final e limpeza
-- =====================================================================
reset role;

-- Só os 3 cadastros permitidos podem ter sido gravados; os bloqueados não deixam rastro.
insert into resultados (teste, esperado, obtido)
  select 'Total de processos de teste realmente gravados (só os 3 permitidos)', '3', count(*)::text
  from public.processes where client = 'TESTE-CADASTRO';

delete from public.processes where client = 'TESTE-CADASTRO';
update public.profiles set auth_user_id = null where office_id = 'e9184ec0-1771-b6a1-0bb0-506f9c19dab3' and name = 'Marina Rocha';
delete from auth.users where id = 'aaaaaaaa-0000-0000-0000-0000000000a1';

insert into resultados (teste, esperado, obtido)
  select 'Limpeza: processos de teste que sobraram', '0', count(*)::text
  from public.processes where client = 'TESTE-CADASTRO';

select
  teste,
  esperado,
  obtido,
  case when esperado = obtido then '✅ OK' else '❌ FALHOU' end as resultado
from resultados
order by ordem;
