-- =====================================================================
-- LexIA — Fase 6: conferência de isolamento entre os DOIS escritórios reais
-- Rode DEPOIS do 01, 02 e 04, e depois de vincular os dois logins aos perfis
-- "Caio Henrique" (Silva & Associados) e "Marcela Ribeiro" (Ribeiro & Lima).
--
-- O que ele faz: "finge" ser cada um dos dois logins (como se estivesse logado no
-- site) e confere, tabela por tabela, que cada um vê TODOS os dados do próprio
-- escritório e NENHUM do outro. Mostra ✅ ou ❌ em cada teste.
-- Se um login NÃO estiver vinculado, os testes dele FALHAM (❌): nunca passam "em branco".
--
-- É seguro: não cria, apaga nem altera dado nenhum (as tentativas de alteração
-- usam "coluna = ela mesma", que não muda nada mesmo se passasse) e não mexe nos
-- vínculos dos logins. Pode rodar quantas vezes quiser, a qualquer momento.
-- Se ALGUM teste mostrar ❌, não avance.
-- =====================================================================

reset role;

drop table if exists pg_temp.resultados;
drop table if exists pg_temp.esperado;
create temp table resultados (ordem serial, teste text, esperado text, obtido text);
grant all on resultados to public;
grant all on resultados_ordem_seq to public;

-- Quantas linhas cada escritório TEM de verdade (contado como administrador do banco).
create temp table esperado (usuario text, tabela text, qtd bigint);
grant all on esperado to public;

insert into esperado select 'caio', 'offices', count(*) from public.offices where id = 'e9184ec0-1771-b6a1-0bb0-506f9c19dab3';
insert into esperado select 'caio', 'profiles', count(*) from public.profiles where office_id = 'e9184ec0-1771-b6a1-0bb0-506f9c19dab3';
insert into esperado select 'caio', 'processes', count(*) from public.processes where office_id = 'e9184ec0-1771-b6a1-0bb0-506f9c19dab3';
insert into esperado select 'caio', 'documents', count(*) from public.documents where office_id = 'e9184ec0-1771-b6a1-0bb0-506f9c19dab3';
insert into esperado select 'caio', 'process_events', count(*) from public.process_events where office_id = 'e9184ec0-1771-b6a1-0bb0-506f9c19dab3';
insert into esperado select 'caio', 'analyses', count(*) from public.analyses where office_id = 'e9184ec0-1771-b6a1-0bb0-506f9c19dab3';
insert into esperado select 'caio', 'analysis_items', count(*) from public.analysis_items where office_id = 'e9184ec0-1771-b6a1-0bb0-506f9c19dab3';
insert into esperado select 'caio', 'consultations', count(*) from public.consultations where office_id = 'e9184ec0-1771-b6a1-0bb0-506f9c19dab3';
insert into esperado select 'caio', 'deadlines', count(*) from public.deadlines where office_id = 'e9184ec0-1771-b6a1-0bb0-506f9c19dab3';
insert into esperado select 'marcela', 'offices', count(*) from public.offices where id = 'cb7a3f10-2d54-4e8b-9a61-7f3d2e1c0b94';
insert into esperado select 'marcela', 'profiles', count(*) from public.profiles where office_id = 'cb7a3f10-2d54-4e8b-9a61-7f3d2e1c0b94';
insert into esperado select 'marcela', 'processes', count(*) from public.processes where office_id = 'cb7a3f10-2d54-4e8b-9a61-7f3d2e1c0b94';
insert into esperado select 'marcela', 'documents', count(*) from public.documents where office_id = 'cb7a3f10-2d54-4e8b-9a61-7f3d2e1c0b94';
insert into esperado select 'marcela', 'process_events', count(*) from public.process_events where office_id = 'cb7a3f10-2d54-4e8b-9a61-7f3d2e1c0b94';
insert into esperado select 'marcela', 'analyses', count(*) from public.analyses where office_id = 'cb7a3f10-2d54-4e8b-9a61-7f3d2e1c0b94';
insert into esperado select 'marcela', 'analysis_items', count(*) from public.analysis_items where office_id = 'cb7a3f10-2d54-4e8b-9a61-7f3d2e1c0b94';
insert into esperado select 'marcela', 'consultations', count(*) from public.consultations where office_id = 'cb7a3f10-2d54-4e8b-9a61-7f3d2e1c0b94';
insert into esperado select 'marcela', 'deadlines', count(*) from public.deadlines where office_id = 'cb7a3f10-2d54-4e8b-9a61-7f3d2e1c0b94';

-- Pré-condição: cada login precisa estar vinculado ao perfil do seu escritório.
insert into resultados (teste, esperado, obtido)
  select 'Caio (Silva): login vinculado ao perfil Caio Henrique', 'sim', case when count(auth_user_id) = 1 then 'sim' else 'NÃO' end
  from public.profiles where office_id = 'e9184ec0-1771-b6a1-0bb0-506f9c19dab3' and name = 'Caio Henrique';
insert into resultados (teste, esperado, obtido)
  select 'Marcela (Ribeiro & Lima): login vinculado ao perfil Marcela Ribeiro', 'sim', case when count(auth_user_id) = 1 then 'sim' else 'NÃO' end
  from public.profiles where office_id = 'cb7a3f10-2d54-4e8b-9a61-7f3d2e1c0b94' and name = 'Marcela Ribeiro';

-- =====================================================================
-- COMO CAIO (SILVA)
-- =====================================================================
reset role;
select set_config('request.jwt.claim.sub', coalesce((select auth_user_id::text from public.profiles where office_id = 'e9184ec0-1771-b6a1-0bb0-506f9c19dab3' and name = 'Caio Henrique'), ''), false);
set role authenticated;

insert into resultados (teste, esperado, obtido)
  select 'Caio (Silva) vê escritórios (todos os do próprio escritório)', (select qtd::text from esperado where usuario = 'caio' and tabela = 'offices'), count(*)::text from public.offices;
insert into resultados (teste, esperado, obtido)
  select 'Caio (Silva) vê pessoas da equipe (todos os do próprio escritório)', (select qtd::text from esperado where usuario = 'caio' and tabela = 'profiles'), count(*)::text from public.profiles;
insert into resultados (teste, esperado, obtido)
  select 'Caio (Silva) vê processos (todos os do próprio escritório)', (select qtd::text from esperado where usuario = 'caio' and tabela = 'processes'), count(*)::text from public.processes;
insert into resultados (teste, esperado, obtido)
  select 'Caio (Silva) vê documentos (todos os do próprio escritório)', (select qtd::text from esperado where usuario = 'caio' and tabela = 'documents'), count(*)::text from public.documents;
insert into resultados (teste, esperado, obtido)
  select 'Caio (Silva) vê movimentações (todos os do próprio escritório)', (select qtd::text from esperado where usuario = 'caio' and tabela = 'process_events'), count(*)::text from public.process_events;
insert into resultados (teste, esperado, obtido)
  select 'Caio (Silva) vê análises (todos os do próprio escritório)', (select qtd::text from esperado where usuario = 'caio' and tabela = 'analyses'), count(*)::text from public.analyses;
insert into resultados (teste, esperado, obtido)
  select 'Caio (Silva) vê itens de análise (todos os do próprio escritório)', (select qtd::text from esperado where usuario = 'caio' and tabela = 'analysis_items'), count(*)::text from public.analysis_items;
insert into resultados (teste, esperado, obtido)
  select 'Caio (Silva) vê consultas (todos os do próprio escritório)', (select qtd::text from esperado where usuario = 'caio' and tabela = 'consultations'), count(*)::text from public.consultations;
insert into resultados (teste, esperado, obtido)
  select 'Caio (Silva) vê prazos (todos os do próprio escritório)', (select qtd::text from esperado where usuario = 'caio' and tabela = 'deadlines'), count(*)::text from public.deadlines;
insert into resultados (teste, esperado, obtido)
  select 'Caio (Silva) vê linhas do escritório Ribeiro & Lima (9 tabelas somadas)', '0',
    ((select count(*) from public.offices where id = 'cb7a3f10-2d54-4e8b-9a61-7f3d2e1c0b94') + (select count(*) from public.profiles where office_id = 'cb7a3f10-2d54-4e8b-9a61-7f3d2e1c0b94') + (select count(*) from public.processes where office_id = 'cb7a3f10-2d54-4e8b-9a61-7f3d2e1c0b94') + (select count(*) from public.documents where office_id = 'cb7a3f10-2d54-4e8b-9a61-7f3d2e1c0b94') + (select count(*) from public.process_events where office_id = 'cb7a3f10-2d54-4e8b-9a61-7f3d2e1c0b94') + (select count(*) from public.analyses where office_id = 'cb7a3f10-2d54-4e8b-9a61-7f3d2e1c0b94') + (select count(*) from public.analysis_items where office_id = 'cb7a3f10-2d54-4e8b-9a61-7f3d2e1c0b94') + (select count(*) from public.consultations where office_id = 'cb7a3f10-2d54-4e8b-9a61-7f3d2e1c0b94') + (select count(*) from public.deadlines where office_id = 'cb7a3f10-2d54-4e8b-9a61-7f3d2e1c0b94'))::text;
insert into resultados (teste, esperado, obtido)
  select 'Caio (Silva) abre por id um processo do escritório Ribeiro & Lima', '0', count(*)::text from public.processes where id = md5('lexia:rl:proc-1')::uuid;
with u as (update public.processes set status = status where office_id = 'cb7a3f10-2d54-4e8b-9a61-7f3d2e1c0b94' returning 1)
  insert into resultados (teste, esperado, obtido) select 'Caio (Silva) tenta ALTERAR processos do escritório Ribeiro & Lima (linhas afetadas)', '0', count(*)::text from u;
with u as (update public.documents set name = name where office_id = 'cb7a3f10-2d54-4e8b-9a61-7f3d2e1c0b94' returning 1)
  insert into resultados (teste, esperado, obtido) select 'Caio (Silva) tenta ALTERAR documentos do escritório Ribeiro & Lima (linhas afetadas)', '0', count(*)::text from u;
with u as (update public.analyses set status = status where office_id = 'cb7a3f10-2d54-4e8b-9a61-7f3d2e1c0b94' returning 1)
  insert into resultados (teste, esperado, obtido) select 'Caio (Silva) tenta ALTERAR análises do escritório Ribeiro & Lima (linhas afetadas)', '0', count(*)::text from u;
with u as (update public.deadlines set title = title where office_id = 'cb7a3f10-2d54-4e8b-9a61-7f3d2e1c0b94' returning 1)
  insert into resultados (teste, esperado, obtido) select 'Caio (Silva) tenta ALTERAR prazos do escritório Ribeiro & Lima (linhas afetadas)', '0', count(*)::text from u;
with u as (update public.profiles set name = name where office_id = 'cb7a3f10-2d54-4e8b-9a61-7f3d2e1c0b94' returning 1)
  insert into resultados (teste, esperado, obtido) select 'Caio (Silva) tenta ALTERAR pessoas da equipe do escritório Ribeiro & Lima (linhas afetadas)', '0', count(*)::text from u;

-- =====================================================================
-- COMO MARCELA (RIBEIRO & LIMA)
-- =====================================================================
reset role;
select set_config('request.jwt.claim.sub', coalesce((select auth_user_id::text from public.profiles where office_id = 'cb7a3f10-2d54-4e8b-9a61-7f3d2e1c0b94' and name = 'Marcela Ribeiro'), ''), false);
set role authenticated;

insert into resultados (teste, esperado, obtido)
  select 'Marcela (Ribeiro & Lima) vê escritórios (todos os do próprio escritório)', (select qtd::text from esperado where usuario = 'marcela' and tabela = 'offices'), count(*)::text from public.offices;
insert into resultados (teste, esperado, obtido)
  select 'Marcela (Ribeiro & Lima) vê pessoas da equipe (todos os do próprio escritório)', (select qtd::text from esperado where usuario = 'marcela' and tabela = 'profiles'), count(*)::text from public.profiles;
insert into resultados (teste, esperado, obtido)
  select 'Marcela (Ribeiro & Lima) vê processos (todos os do próprio escritório)', (select qtd::text from esperado where usuario = 'marcela' and tabela = 'processes'), count(*)::text from public.processes;
insert into resultados (teste, esperado, obtido)
  select 'Marcela (Ribeiro & Lima) vê documentos (todos os do próprio escritório)', (select qtd::text from esperado where usuario = 'marcela' and tabela = 'documents'), count(*)::text from public.documents;
insert into resultados (teste, esperado, obtido)
  select 'Marcela (Ribeiro & Lima) vê movimentações (todos os do próprio escritório)', (select qtd::text from esperado where usuario = 'marcela' and tabela = 'process_events'), count(*)::text from public.process_events;
insert into resultados (teste, esperado, obtido)
  select 'Marcela (Ribeiro & Lima) vê análises (todos os do próprio escritório)', (select qtd::text from esperado where usuario = 'marcela' and tabela = 'analyses'), count(*)::text from public.analyses;
insert into resultados (teste, esperado, obtido)
  select 'Marcela (Ribeiro & Lima) vê itens de análise (todos os do próprio escritório)', (select qtd::text from esperado where usuario = 'marcela' and tabela = 'analysis_items'), count(*)::text from public.analysis_items;
insert into resultados (teste, esperado, obtido)
  select 'Marcela (Ribeiro & Lima) vê consultas (todos os do próprio escritório)', (select qtd::text from esperado where usuario = 'marcela' and tabela = 'consultations'), count(*)::text from public.consultations;
insert into resultados (teste, esperado, obtido)
  select 'Marcela (Ribeiro & Lima) vê prazos (todos os do próprio escritório)', (select qtd::text from esperado where usuario = 'marcela' and tabela = 'deadlines'), count(*)::text from public.deadlines;
insert into resultados (teste, esperado, obtido)
  select 'Marcela (Ribeiro & Lima) vê linhas do escritório Silva (9 tabelas somadas)', '0',
    ((select count(*) from public.offices where id = 'e9184ec0-1771-b6a1-0bb0-506f9c19dab3') + (select count(*) from public.profiles where office_id = 'e9184ec0-1771-b6a1-0bb0-506f9c19dab3') + (select count(*) from public.processes where office_id = 'e9184ec0-1771-b6a1-0bb0-506f9c19dab3') + (select count(*) from public.documents where office_id = 'e9184ec0-1771-b6a1-0bb0-506f9c19dab3') + (select count(*) from public.process_events where office_id = 'e9184ec0-1771-b6a1-0bb0-506f9c19dab3') + (select count(*) from public.analyses where office_id = 'e9184ec0-1771-b6a1-0bb0-506f9c19dab3') + (select count(*) from public.analysis_items where office_id = 'e9184ec0-1771-b6a1-0bb0-506f9c19dab3') + (select count(*) from public.consultations where office_id = 'e9184ec0-1771-b6a1-0bb0-506f9c19dab3') + (select count(*) from public.deadlines where office_id = 'e9184ec0-1771-b6a1-0bb0-506f9c19dab3'))::text;
insert into resultados (teste, esperado, obtido)
  select 'Marcela (Ribeiro & Lima) abre por id um processo do escritório Silva', '0', count(*)::text from public.processes where id = md5('lexia:proc-1')::uuid;
with u as (update public.processes set status = status where office_id = 'e9184ec0-1771-b6a1-0bb0-506f9c19dab3' returning 1)
  insert into resultados (teste, esperado, obtido) select 'Marcela (Ribeiro & Lima) tenta ALTERAR processos do escritório Silva (linhas afetadas)', '0', count(*)::text from u;
with u as (update public.documents set name = name where office_id = 'e9184ec0-1771-b6a1-0bb0-506f9c19dab3' returning 1)
  insert into resultados (teste, esperado, obtido) select 'Marcela (Ribeiro & Lima) tenta ALTERAR documentos do escritório Silva (linhas afetadas)', '0', count(*)::text from u;
with u as (update public.analyses set status = status where office_id = 'e9184ec0-1771-b6a1-0bb0-506f9c19dab3' returning 1)
  insert into resultados (teste, esperado, obtido) select 'Marcela (Ribeiro & Lima) tenta ALTERAR análises do escritório Silva (linhas afetadas)', '0', count(*)::text from u;
with u as (update public.deadlines set title = title where office_id = 'e9184ec0-1771-b6a1-0bb0-506f9c19dab3' returning 1)
  insert into resultados (teste, esperado, obtido) select 'Marcela (Ribeiro & Lima) tenta ALTERAR prazos do escritório Silva (linhas afetadas)', '0', count(*)::text from u;
with u as (update public.profiles set name = name where office_id = 'e9184ec0-1771-b6a1-0bb0-506f9c19dab3' returning 1)
  insert into resultados (teste, esperado, obtido) select 'Marcela (Ribeiro & Lima) tenta ALTERAR pessoas da equipe do escritório Silva (linhas afetadas)', '0', count(*)::text from u;

-- =====================================================================
-- VISITANTE SEM LOGIN
-- =====================================================================
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
-- Resultado
-- =====================================================================
reset role;

select
  teste,
  esperado,
  obtido,
  case when esperado = obtido then '✅ OK' else '❌ FALHOU' end as resultado
from resultados
order by ordem;
