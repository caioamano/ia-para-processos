-- =====================================================================
-- LexIA — Fase 4: teste de isolamento entre escritórios (RLS)
-- Rode DEPOIS do 01 e do 02. Mostra uma tabela com ✅ ou ❌ em cada teste.
--
-- O que ele faz:
--   1. cria um SEGUNDO escritório de teste ("Moura Advocacia") com um processo;
--   2. "finge" ser cada usuário (como se estivesse logado) e tenta ver/alterar
--      dados que não deveria;
--   3. apaga tudo que criou, deixando o banco exatamente como estava.
--
-- Se ALGUM teste mostrar ❌, não avance: há um furo de segurança.
-- Se o script parar com erro no meio, rode-o de novo (ele limpa o que sobrou).
-- =====================================================================
-- ATENÇÃO (depois da Fase 5): NÃO rode este script de novo. Ele foi feito para o banco ANTES
-- dos logins reais e, ao limpar, remove o vínculo do seu login com o perfil Caio Henrique
-- (o painel passaria a mostrar "Conta ainda sem escritório"). Para conferir o isolamento
-- agora, use o 05_conferir_isolamento.sql, que não altera nada.
-- =====================================================================

-- ---------- Limpeza (também roda no início, caso uma execução anterior tenha parado) ----------
reset role;
delete from public.offices where name = 'Moura Advocacia (TESTE)';
delete from public.processes where number = '9999999-99.2026.8.16.9999';
delete from public.documents where name = 'TESTE-RLS';
delete from public.consultations where question = 'TESTE-RLS';
update public.profiles set auth_user_id = null
  where office_id = (select id from public.offices where name = 'Silva & Associados');
delete from auth.users where id in (
  'aaaaaaaa-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000002',
  'aaaaaaaa-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000004',
  'aaaaaaaa-0000-0000-0000-000000000005');

-- ---------- Preparação (feita como administrador do banco) ----------
-- Usuários de login de teste: Caio (admin), Ana (advogada), Marina (estagiária) da Silva,
-- Dani (admin) da Moura e um usuário logado que NÃO pertence a nenhum escritório.
insert into auth.users (id, email) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'teste-caio@example.com'),
  ('aaaaaaaa-0000-0000-0000-000000000002', 'teste-ana@example.com'),
  ('aaaaaaaa-0000-0000-0000-000000000003', 'teste-marina@example.com'),
  ('aaaaaaaa-0000-0000-0000-000000000004', 'teste-dani@example.com'),
  ('aaaaaaaa-0000-0000-0000-000000000005', 'teste-sem-escritorio@example.com');

update public.profiles set auth_user_id = 'aaaaaaaa-0000-0000-0000-000000000001' where name = 'Caio Henrique';
update public.profiles set auth_user_id = 'aaaaaaaa-0000-0000-0000-000000000002' where name = 'Ana Beatriz';
update public.profiles set auth_user_id = 'aaaaaaaa-0000-0000-0000-000000000003' where name = 'Marina Rocha';

insert into public.offices (id, name) values
  ('bbbbbbbb-0000-0000-0000-000000000001', 'Moura Advocacia (TESTE)');
insert into public.profiles (id, office_id, auth_user_id, name, email, role, status) values
  ('bbbbbbbb-0000-0000-0000-000000000002', 'bbbbbbbb-0000-0000-0000-000000000001',
   'aaaaaaaa-0000-0000-0000-000000000004', 'Dani Moura', 'dani@moura-teste.example', 'Administrador', 'Ativo');
insert into public.processes (id, office_id, number, client, type, status) values
  ('bbbbbbbb-0000-0000-0000-000000000003', 'bbbbbbbb-0000-0000-0000-000000000001',
   '9999999-99.2026.8.16.9999', 'Cliente sigiloso da Moura', 'Cível', 'Em andamento');

create temp table resultados (ordem serial, teste text, esperado text, obtido text);
grant all on resultados to public;
grant all on resultados_ordem_seq to public;

-- =====================================================================
-- TESTES COMO CAIO (Administrador da Silva)
-- =====================================================================
select set_config('request.jwt.claim.sub', 'aaaaaaaa-0000-0000-0000-000000000001', false);
set role authenticated;

insert into resultados (teste, esperado, obtido)
  select 'Caio vê os processos do próprio escritório', '128', count(*)::text from public.processes;
insert into resultados (teste, esperado, obtido)
  select 'Caio vê processos da Moura', '0', count(*)::text from public.processes where office_id = 'bbbbbbbb-0000-0000-0000-000000000001';
insert into resultados (teste, esperado, obtido)
  select 'Caio vê os documentos do próprio escritório', '768', count(*)::text from public.documents;
insert into resultados (teste, esperado, obtido)
  select 'Caio vê quantos escritórios', '1', count(*)::text from public.offices;
insert into resultados (teste, esperado, obtido)
  select 'Caio vê a equipe do próprio escritório', '5', count(*)::text from public.profiles;

do $$ begin
  insert into public.processes (office_id, number, client, type, status)
    values ('bbbbbbbb-0000-0000-0000-000000000001', '1111111-11.2026.8.16.0001', 'Invasão', 'Cível', 'Pendente');
  insert into resultados (teste, esperado, obtido) values ('Caio tenta CRIAR processo dentro da Moura', 'bloqueado', 'PERMITIDO');
exception when others then
  insert into resultados (teste, esperado, obtido) values ('Caio tenta CRIAR processo dentro da Moura', 'bloqueado', 'bloqueado');
end $$;

with u as (update public.processes set status = 'Concluído' where id = 'bbbbbbbb-0000-0000-0000-000000000003' returning 1)
  insert into resultados (teste, esperado, obtido) select 'Caio tenta ALTERAR processo da Moura (linhas afetadas)', '0', count(*)::text from u;
with d as (delete from public.processes where id = 'bbbbbbbb-0000-0000-0000-000000000003' returning 1)
  insert into resultados (teste, esperado, obtido) select 'Caio tenta APAGAR processo da Moura (linhas afetadas)', '0', count(*)::text from d;

-- Tenta "enganar" o banco: documento marcado como da Silva, mas ligado a um processo da Moura.
do $$ begin
  insert into public.documents (office_id, process_id, name, file_name, pages, size_bytes)
    select p.id, 'bbbbbbbb-0000-0000-0000-000000000003', 'TESTE-RLS', 'x.pdf', 1, 1
    from public.offices p where p.name = 'Silva & Associados';
  insert into resultados (teste, esperado, obtido) values ('Caio tenta ligar um documento seu a processo da Moura', 'bloqueado', 'PERMITIDO');
exception when others then
  insert into resultados (teste, esperado, obtido) values ('Caio tenta ligar um documento seu a processo da Moura', 'bloqueado', 'bloqueado');
end $$;

-- Caio é administrador: pode criar processo no próprio escritório.
do $$ begin
  insert into public.processes (office_id, number, client, type, status)
    select id, '9999999-99.2026.8.16.9998', 'Teste Caio', 'Cível', 'Pendente' from public.offices where name = 'Silva & Associados';
  insert into resultados (teste, esperado, obtido) values ('Caio (admin) cria processo no próprio escritório', 'permitido', 'permitido');
exception when others then
  insert into resultados (teste, esperado, obtido) values ('Caio (admin) cria processo no próprio escritório', 'permitido', 'bloqueado');
end $$;

-- =====================================================================
-- TESTES COMO ANA (Advogada da Silva)
-- =====================================================================
reset role;
delete from public.processes where number = '9999999-99.2026.8.16.9998';
select set_config('request.jwt.claim.sub', 'aaaaaaaa-0000-0000-0000-000000000002', false);
set role authenticated;

with u as (update public.analyses set status = status returning 1)
  insert into resultados (teste, esperado, obtido) select 'Ana (advogada) edita análises (linhas afetadas)', '128', count(*)::text from u;
with u as (update public.profiles set name = name returning 1)
  insert into resultados (teste, esperado, obtido) select 'Ana (advogada) tenta gerenciar a equipe (linhas afetadas)', '0', count(*)::text from u;

-- =====================================================================
-- TESTES COMO MARINA (Estagiária da Silva)
-- =====================================================================
reset role;
select set_config('request.jwt.claim.sub', 'aaaaaaaa-0000-0000-0000-000000000003', false);
set role authenticated;

insert into resultados (teste, esperado, obtido)
  select 'Marina (estagiária) vê os processos', '128', count(*)::text from public.processes;

do $$ begin
  insert into public.processes (office_id, number, client, type, status)
    select id, '9999999-99.2026.8.16.9997', 'Teste Marina', 'Cível', 'Pendente' from public.offices where name = 'Silva & Associados';
  insert into resultados (teste, esperado, obtido) values ('Marina tenta cadastrar processo', 'bloqueado', 'PERMITIDO');
exception when others then
  insert into resultados (teste, esperado, obtido) values ('Marina tenta cadastrar processo', 'bloqueado', 'bloqueado');
end $$;

with u as (update public.analyses set status = status returning 1)
  insert into resultados (teste, esperado, obtido) select 'Marina tenta editar análises (linhas afetadas)', '0', count(*)::text from u;

do $$ begin
  insert into public.documents (office_id, process_id, name, file_name, pages, size_bytes)
    select office_id, id, 'TESTE-RLS', 'x.pdf', 1, 1 from public.processes limit 1;
  insert into resultados (teste, esperado, obtido) values ('Marina envia um documento', 'permitido', 'permitido');
exception when others then
  insert into resultados (teste, esperado, obtido) values ('Marina envia um documento', 'permitido', 'bloqueado');
end $$;

do $$ begin
  insert into public.consultations (office_id, process_id, profile_id, question, answer)
    select office_id, id, (select private.current_profile_id()), 'TESTE-RLS', 'x' from public.processes limit 1;
  insert into resultados (teste, esperado, obtido) values ('Marina registra uma consulta em seu nome', 'permitido', 'permitido');
exception when others then
  insert into resultados (teste, esperado, obtido) values ('Marina registra uma consulta em seu nome', 'permitido', 'bloqueado');
end $$;

do $$ begin
  insert into public.consultations (office_id, process_id, profile_id, question, answer)
    select office_id, id, (select id from public.profiles where name = 'Caio Henrique'), 'TESTE-RLS', 'x' from public.processes limit 1;
  insert into resultados (teste, esperado, obtido) values ('Marina tenta registrar consulta em nome do Caio', 'bloqueado', 'PERMITIDO');
exception when others then
  insert into resultados (teste, esperado, obtido) values ('Marina tenta registrar consulta em nome do Caio', 'bloqueado', 'bloqueado');
end $$;

-- =====================================================================
-- TESTES COMO DANI (Administradora da Moura)
-- =====================================================================
reset role;
select set_config('request.jwt.claim.sub', 'aaaaaaaa-0000-0000-0000-000000000004', false);
set role authenticated;

insert into resultados (teste, esperado, obtido)
  select 'Dani (Moura) vê quantos processos no total', '1', count(*)::text from public.processes;
insert into resultados (teste, esperado, obtido)
  select 'Dani (Moura) vê processos da Silva', '0', count(*)::text from public.processes where number like '0001234-56%';
insert into resultados (teste, esperado, obtido)
  select 'Dani (Moura) vê documentos da Silva', '0', count(*)::text from public.documents;
insert into resultados (teste, esperado, obtido)
  select 'Dani (Moura) vê integrantes da equipe da Silva', '0', count(*)::text from public.profiles where name = 'Caio Henrique';

-- =====================================================================
-- USUÁRIO LOGADO SEM ESCRITÓRIO e VISITANTE SEM LOGIN
-- =====================================================================
reset role;
select set_config('request.jwt.claim.sub', 'aaaaaaaa-0000-0000-0000-000000000005', false);
set role authenticated;

insert into resultados (teste, esperado, obtido)
  select 'Usuário sem escritório vê processos', '0', count(*)::text from public.processes;

reset role;
select set_config('request.jwt.claim.sub', '', false);
set role anon;

do $$ declare n bigint; begin
  select count(*) into n from public.processes;
  insert into resultados (teste, esperado, obtido) values ('Visitante sem login lê processos', 'bloqueado', 'PERMITIDO (' || n || ' linhas)');
exception when others then
  insert into resultados (teste, esperado, obtido) values ('Visitante sem login lê processos', 'bloqueado', 'bloqueado');
end $$;

-- =====================================================================
-- Limpeza final e resultado
-- =====================================================================
reset role;
delete from public.offices where name = 'Moura Advocacia (TESTE)';
delete from public.processes where number like '9999999-99.2026.8.16.%';
delete from public.documents where name = 'TESTE-RLS';
delete from public.consultations where question = 'TESTE-RLS';
update public.profiles set auth_user_id = null
  where office_id = (select id from public.offices where name = 'Silva & Associados');
delete from auth.users where id in (
  'aaaaaaaa-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000002',
  'aaaaaaaa-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000004',
  'aaaaaaaa-0000-0000-0000-000000000005');

select
  teste,
  esperado,
  obtido,
  case when esperado = obtido then '✅ OK' else '❌ FALHOU' end as resultado
from resultados
order by ordem;
