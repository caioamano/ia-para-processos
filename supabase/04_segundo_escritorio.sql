-- =====================================================================
-- LexIA — Fase 6: SEGUNDO escritório FICTÍCIO (Ribeiro & Lima Advocacia)
-- Rode DEPOIS do 01 e do 02. Nenhum dado aqui é real.
--
-- Para que serve: provar que um escritório nunca enxerga os dados do outro.
-- Os dados são propositalmente diferentes dos da Silva & Associados (outros
-- clientes, outros números de processo, outra equipe), assim fica fácil ver
-- na tela se algo "vazou".
--
-- Este script NÃO mexe no escritório Silva & Associados nem no vínculo do seu
-- login. Pode rodar de novo quando quiser: ele apaga só o Ribeiro & Lima e
-- recria (nesse caso, refaça o vínculo do login da Marcela, ver passo no chat).
-- =====================================================================

delete from public.offices where id = 'cb7a3f10-2d54-4e8b-9a61-7f3d2e1c0b94';

insert into public.offices (id, name) values ('cb7a3f10-2d54-4e8b-9a61-7f3d2e1c0b94', 'Ribeiro & Lima Advocacia');

-- Equipe. auth_user_id fica vazio até o vínculo com um login (Authentication → Users).
insert into public.profiles (id, office_id, name, email, role, status, last_access_at) values
  (md5('lexia:rl:profile:user-marcela')::uuid, 'cb7a3f10-2d54-4e8b-9a61-7f3d2e1c0b94', 'Marcela Ribeiro', 'marcela@ribeirolima.example', 'Administrador', 'Ativo', '2026-10-08 10:15:00-03'),
  (md5('lexia:rl:profile:user-otavio')::uuid, 'cb7a3f10-2d54-4e8b-9a61-7f3d2e1c0b94', 'Otávio Lima', 'otavio@ribeirolima.example', 'Advogado', 'Ativo', '2026-10-07 18:40:00-03'),
  (md5('lexia:rl:profile:user-leticia')::uuid, 'cb7a3f10-2d54-4e8b-9a61-7f3d2e1c0b94', 'Letícia Prado', 'leticia@ribeirolima.example', 'Estagiário', 'Convite pendente', null);

-- Lista base dos 8 processos (tabela temporária: some ao fim da sessão).
drop table if exists pg_temp.seed2_processes;
drop table if exists pg_temp.seed2_base;
create temp table seed2_base (
  n int, number text, client text, type text, status text, responsible text, updated_at timestamptz
);
insert into seed2_base values
  (1, '0102030-41.2026.8.16.0021', 'Teixeira & Filhos Ltda.',      'Cível',       'Em andamento', 'Marcela Ribeiro', '2026-10-08 10:15:00-03'),
  (2, '0203040-52.2025.5.09.0013', 'Débora Nascimento',            'Trabalhista', 'Em análise',   'Otávio Lima',     '2026-10-07 18:40:00-03'),
  (3, '0304050-63.2024.8.26.0050', 'Cooperativa Agro Vale',        'Empresarial', 'Pendente',     'Marcela Ribeiro', '2026-10-05 12:00:00-03'),
  (4, '0405060-74.2026.8.16.0021', 'Henrique Zanetti',             'Cível',       'Concluído',    'Otávio Lima',     '2026-10-02 12:00:00-03'),
  (5, '0506070-85.2025.8.19.0002', 'Mercado Central Atacadista',   'Tributário',  'Em andamento', 'Marcela Ribeiro', '2026-09-30 12:00:00-03'),
  (6, '0607080-96.2024.5.09.0013', 'Studio Lume Design',           'Trabalhista', 'Em andamento', 'Otávio Lima',     '2026-09-28 12:00:00-03'),
  (7, '0708090-17.2026.8.26.0050', 'Priscila Andrade Lopes',       'Empresarial', 'Em análise',   'Marcela Ribeiro', '2026-09-25 12:00:00-03'),
  (8, '0809010-28.2025.8.16.0021', 'Gráfica Rápida Paraná',        'Cível',       'Pendente',     'Otávio Lima',     '2026-09-22 12:00:00-03');

-- Completa cada processo com vara, valor da causa, parte contrária e data de distribuição.
-- A "data base" de cada processo é 13/09/2026 menos (n mod 20) dias.
create temp table seed2_processes as
select
  b.*,
  (date '2026-09-13' - (b.n % 20)) as base_date,
  (b.n % 6 + 1) || 'ª ' || case b.type
    when 'Cível' then 'Vara Cível'
    when 'Trabalhista' then 'Vara do Trabalho'
    when 'Empresarial' then 'Vara Empresarial'
    else 'Vara da Fazenda Pública' end as court,
  (25000 + ((b.n * 7919) % 400000))::numeric(14, 2) as case_value,
  (array['Banco Meridional S.A.', 'Seguradora Atlântica', 'Imobiliária Prime Ltda.',
         'Telecom Brasil S.A.', 'Construtora Pilar Ltda.', 'Comercial Vitória Ltda.'])[b.n % 6 + 1] as counterparty
from seed2_base b;

-- Valor em reais no formato brasileiro (R$ 85.000,00), para os textos da análise.
create or replace function pg_temp.brl(v numeric) returns text language sql immutable as
$$ select 'R$' || chr(160) || translate(to_char(v, 'FM999,999,999.00'), ',.', '.,') $$;

insert into public.processes (id, office_id, number, client, type, status, responsible_id,
                              court, case_value, counterparty, distributed_at, created_at, updated_at)
select md5('lexia:rl:proc-' || p.n)::uuid, 'cb7a3f10-2d54-4e8b-9a61-7f3d2e1c0b94', p.number, p.client, p.type, p.status, r.id,
       p.court, p.case_value, p.counterparty, p.base_date - 70,
       (p.base_date - 70)::timestamp at time zone 'America/Sao_Paulo', p.updated_at
from seed2_processes p
join public.profiles r on r.office_id = 'cb7a3f10-2d54-4e8b-9a61-7f3d2e1c0b94' and r.name = p.responsible;

-- Prazos do dashboard.
insert into public.deadlines (id, office_id, process_id, title, due_date) values
  (md5('lexia:rl:deadline-1')::uuid, 'cb7a3f10-2d54-4e8b-9a61-7f3d2e1c0b94', md5('lexia:rl:proc-1')::uuid, 'Réplica à contestação', '2026-10-14'),
  (md5('lexia:rl:deadline-2')::uuid, 'cb7a3f10-2d54-4e8b-9a61-7f3d2e1c0b94', md5('lexia:rl:proc-3')::uuid, 'Audiência de instrução', '2026-10-21');

-- Documentos: 6 por processo. A situação deles depende da situação do processo.
insert into public.documents (id, office_id, process_id, name, file_name, pages, size_bytes, status, uploaded_at)
select md5('lexia:rl:doc-' || p.n || '-' || t.idx)::uuid, 'cb7a3f10-2d54-4e8b-9a61-7f3d2e1c0b94', md5('lexia:rl:proc-' || p.n)::uuid,
       t.name, t.file_name, t.pages, round(t.pages * 0.12 * 1048576),
       case p.status
         when 'Concluído'    then 'Analisado'
         when 'Em andamento' then case when t.idx <= 5 then 'Analisado' else 'Em processamento' end
         when 'Em análise'   then case when t.idx <= 3 then 'Analisado' when t.idx <= 5 then 'Em processamento' else 'Pendente' end
         else                     case when t.idx <= 2 then 'Analisado' else 'Pendente' end
       end,
       (p.base_date - t.days_ago)::timestamp at time zone 'America/Sao_Paulo' + interval '12 hours'
from seed2_processes p
cross join lateral (values
  (1, 'Petição Inicial',        'peticao-inicial.pdf',         14 + p.n % 9, 70),
  (2, 'Procuração',             'procuracao.pdf',               2,           70),
  (3, 'Contestação',            'contestacao.pdf',             18 + p.n % 7,  9),
  (4, 'Despacho',               'despacho.pdf',                 2,            0),
  (5, 'Decisão interlocutória', 'decisao-interlocutoria.pdf',   5 + p.n % 3, 41),
  (6, 'Documentos anexos',      'documentos-anexos.pdf',       38 + p.n % 20, 70)
) as t(idx, name, file_name, pages, days_ago);

-- Histórico do processo (5 movimentações por processo).
insert into public.process_events (id, office_id, process_id, event_date, title, description)
select md5('lexia:rl:event-' || p.n || '-' || t.idx)::uuid, 'cb7a3f10-2d54-4e8b-9a61-7f3d2e1c0b94', md5('lexia:rl:proc-' || p.n)::uuid,
       p.base_date - t.days_ago, t.title, t.description
from seed2_processes p
cross join lateral (values
  (1, 'Despacho',               'Intimação da parte autora para manifestação no prazo de 15 dias.', 0),
  (2, 'Juntada de contestação', 'Contestação apresentada por ' || p.counterparty || '.',            9),
  (3, 'Citação',                'Parte ré citada para apresentar defesa.',                         24),
  (4, 'Despacho inicial',       'Petição inicial recebida e citação determinada.',                 41),
  (5, 'Distribuição',           'Processo distribuído à ' || p.court || '.',                       70)
) as t(idx, title, description, days_ago);

-- Análises: uma por processo. A situação vem dos documentos dele.
insert into public.analyses (id, office_id, process_id, status, updated_at)
select md5('lexia:rl:analysis:proc-' || p.n)::uuid, 'cb7a3f10-2d54-4e8b-9a61-7f3d2e1c0b94', md5('lexia:rl:proc-' || p.n)::uuid,
       case when bool_and(d.status = 'Analisado') then 'Concluída'
            when bool_or(d.status = 'Em processamento') then 'Em processamento'
            else 'Pendente' end,
       p.updated_at
from seed2_processes p
join public.documents d on d.process_id = md5('lexia:rl:proc-' || p.n)::uuid
group by p.n, p.updated_at;

-- Itens da análise: 9 por processo, cada um apontando para documento e página de origem.
insert into public.analysis_items (id, office_id, analysis_id, section, position, label, value, source_document_id, source_page)
select md5('lexia:rl:item:proc-' || p.n || ':' || t.pos)::uuid, 'cb7a3f10-2d54-4e8b-9a61-7f3d2e1c0b94', md5('lexia:rl:analysis:proc-' || p.n)::uuid,
       t.section, t.pos, t.label, t.value, d.id, t.page
from seed2_processes p
cross join lateral (values
  (1, 'Partes',     'Autor',                         p.client,                                                'Petição Inicial',  1),
  (2, 'Partes',     'Réu',                           p.counterparty,                                          'Petição Inicial',  1),
  (3, 'Valores',    'Valor da causa',                pg_temp.brl(p.case_value),                               'Petição Inicial',  4),
  (4, 'Pedidos',    'Pedido principal',              'Condenação da parte ré ao pagamento da indenização pleiteada.', 'Petição Inicial', 12),
  (5, 'Pedidos',    'Pedidos acessórios',            'Custas processuais e honorários de sucumbência.',       'Petição Inicial', 13),
  (6, 'Argumentos', 'Parte autora',                  'Narra os fatos que deram origem à ação e fundamenta o pedido.', 'Petição Inicial', 7),
  (7, 'Argumentos', 'Parte ré',                      'Contesta os fatos narrados e impugna o valor pretendido.', 'Contestação',     9),
  (8, 'Decisões',   'Último despacho',               'Determinou a intimação da parte autora para manifestação.', 'Despacho',       1),
  (9, 'Prazos',     'Manifestação da parte autora',  '15 dias, conforme o último despacho.',                  'Despacho',         1)
) as t(pos, section, label, value, doc_name, page)
join public.documents d on d.process_id = md5('lexia:rl:proc-' || p.n)::uuid and d.name = t.doc_name;

-- Consultas: 2 por processo, feitas pelo responsável.
insert into public.consultations (id, office_id, process_id, profile_id, question, answer, source_document_id, source_page, created_at)
select md5('lexia:rl:consult:proc-' || p.n || ':' || t.idx)::uuid, 'cb7a3f10-2d54-4e8b-9a61-7f3d2e1c0b94', md5('lexia:rl:proc-' || p.n)::uuid, r.id,
       t.question, t.answer, d.id, t.page, p.updated_at + (t.idx - 1) * interval '1 second'
from seed2_processes p
join public.profiles r on r.office_id = 'cb7a3f10-2d54-4e8b-9a61-7f3d2e1c0b94' and r.name = p.responsible
cross join lateral (values
  (1, 'Qual é o valor da causa?',
      'O valor da causa informado na petição inicial é de ' || pg_temp.brl(p.case_value) || '.', 'Petição Inicial', 4),
  (2, 'Qual foi o último despacho?',
      'O último despacho determinou a intimação da parte autora para manifestação no prazo de 15 dias.', 'Despacho', 1)
) as t(idx, question, answer, doc_name, page)
join public.documents d on d.process_id = md5('lexia:rl:proc-' || p.n)::uuid and d.name = t.doc_name;

-- Conferência: deve mostrar 8 processos, 48 documentos, 40 movimentações,
-- 8 análises, 72 itens de análise, 16 consultas, 2 prazos e 3 pessoas.
select
  (select count(*) from public.processes      where office_id = 'cb7a3f10-2d54-4e8b-9a61-7f3d2e1c0b94') as processos,
  (select count(*) from public.documents      where office_id = 'cb7a3f10-2d54-4e8b-9a61-7f3d2e1c0b94') as documentos,
  (select count(*) from public.process_events where office_id = 'cb7a3f10-2d54-4e8b-9a61-7f3d2e1c0b94') as movimentacoes,
  (select count(*) from public.analyses       where office_id = 'cb7a3f10-2d54-4e8b-9a61-7f3d2e1c0b94') as analises,
  (select count(*) from public.analysis_items where office_id = 'cb7a3f10-2d54-4e8b-9a61-7f3d2e1c0b94') as itens_analise,
  (select count(*) from public.consultations  where office_id = 'cb7a3f10-2d54-4e8b-9a61-7f3d2e1c0b94') as consultas,
  (select count(*) from public.deadlines      where office_id = 'cb7a3f10-2d54-4e8b-9a61-7f3d2e1c0b94') as prazos,
  (select count(*) from public.profiles       where office_id = 'cb7a3f10-2d54-4e8b-9a61-7f3d2e1c0b94') as equipe;
