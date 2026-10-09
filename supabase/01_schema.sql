-- =====================================================================
-- LexIA — Fase 4: estrutura do banco (tabelas + segurança por escritório)
-- Como usar: Supabase → SQL Editor → New query → cole este arquivo → Run.
-- Pode rodar uma vez só. Se precisar recomeçar do zero, veja o fim do arquivo.
-- =====================================================================
--
-- IDEIA CENTRAL (multi-tenant):
--   Toda tabela, exceto "offices", tem a coluna office_id.
--   O banco (e não o código do site) garante que cada usuário
--   só enxerga as linhas do próprio escritório. Isso se chama
--   Row Level Security (RLS).
--
-- Os valores de status/tipo/função usam os mesmos textos que já aparecem
-- no site ("Em andamento", "Cível", "Advogado"...). Assim a Fase 5 troca os
-- dados fictícios pelos do banco sem precisar traduzir nada.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1) ESCRITÓRIOS
-- ---------------------------------------------------------------------
create table public.offices (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  logo_url    text,
  created_at  timestamptz not null default now()
);


-- ---------------------------------------------------------------------
-- 2) USUÁRIOS DO ESCRITÓRIO (profiles)
-- ---------------------------------------------------------------------
-- O login em si (e-mail e senha) fica numa tabela do Supabase chamada
-- auth.users. A "profiles" guarda o que é do nosso produto: de qual
-- escritório a pessoa é e qual é a função dela.
--
-- auth_user_id fica vazio enquanto a pessoa não tiver conta. É o caso do
-- "Convite pendente": ela já aparece na equipe, mas ainda não fez login.
create table public.profiles (
  id              uuid primary key default gen_random_uuid(),
  office_id       uuid not null references public.offices (id) on delete cascade,
  auth_user_id    uuid unique references auth.users (id) on delete set null,
  name            text not null,
  email           text not null unique,
  role            text not null check (role in ('Administrador', 'Advogado', 'Estagiário')),
  status          text not null default 'Convite pendente' check (status in ('Ativo', 'Convite pendente')),
  last_access_at  timestamptz,
  created_at      timestamptz not null default now(),
  -- Esta restrição "id + office_id" parece repetida, mas é ela que permite
  -- às outras tabelas apontarem para uma pessoa JÁ amarrando o escritório
  -- (veja "chaves compostas" mais abaixo).
  unique (id, office_id)
);


-- ---------------------------------------------------------------------
-- 3) PROCESSOS
-- ---------------------------------------------------------------------
create table public.processes (
  id              uuid primary key default gen_random_uuid(),
  office_id       uuid not null references public.offices (id) on delete cascade,
  number          text not null,
  client          text not null,
  type            text not null check (type in ('Cível', 'Trabalhista', 'Empresarial', 'Tributário')),
  status          text not null check (status in ('Em andamento', 'Em análise', 'Pendente', 'Concluído')),
  responsible_id  uuid,
  court           text,
  case_value      numeric(14, 2),
  counterparty    text,
  distributed_at  date,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  unique (id, office_id),
  -- O mesmo número de processo não pode se repetir dentro do escritório.
  unique (office_id, number),

  -- CHAVE COMPOSTA: o responsável precisa ser alguém DO MESMO escritório.
  -- Sem isso, um erro de código poderia ligar um processo da Silva a uma
  -- pessoa de outro escritório. Se o responsável for removido, o campo
  -- fica vazio, mas o processo continua existindo.
  foreign key (responsible_id, office_id)
    references public.profiles (id, office_id)
    on delete set null (responsible_id)
);
create index processes_office_status_idx on public.processes (office_id, status);


-- ---------------------------------------------------------------------
-- 4) DOCUMENTOS
-- ---------------------------------------------------------------------
-- storage_path vai guardar o caminho do PDF no Supabase Storage (Fase 8).
-- Por enquanto fica vazio: os dados fictícios não têm arquivo de verdade.
create table public.documents (
  id            uuid primary key default gen_random_uuid(),
  office_id     uuid not null references public.offices (id) on delete cascade,
  process_id    uuid not null,
  name          text not null,
  file_name     text not null,
  pages         integer not null check (pages > 0),
  size_bytes    bigint not null check (size_bytes >= 0),
  storage_path  text,
  status        text not null default 'Pendente' check (status in ('Analisado', 'Em processamento', 'Pendente')),
  uploaded_by   uuid,
  uploaded_at   timestamptz not null default now(),

  unique (id, office_id),
  foreign key (process_id, office_id)
    references public.processes (id, office_id) on delete cascade,
  foreign key (uploaded_by, office_id)
    references public.profiles (id, office_id) on delete set null (uploaded_by)
);
create index documents_process_idx on public.documents (office_id, process_id);


-- ---------------------------------------------------------------------
-- 5) HISTÓRICO DO PROCESSO (movimentações)
-- ---------------------------------------------------------------------
create table public.process_events (
  id           uuid primary key default gen_random_uuid(),
  office_id    uuid not null references public.offices (id) on delete cascade,
  process_id   uuid not null,
  event_date   date not null,
  title        text not null,
  description  text not null,

  foreign key (process_id, office_id)
    references public.processes (id, office_id) on delete cascade
);
create index process_events_process_idx on public.process_events (office_id, process_id, event_date desc);


-- ---------------------------------------------------------------------
-- 6) ANÁLISES
-- ---------------------------------------------------------------------
-- Uma análise por processo (o "cabeçalho": situação e data) ...
create table public.analyses (
  id          uuid primary key default gen_random_uuid(),
  office_id   uuid not null references public.offices (id) on delete cascade,
  process_id  uuid not null,
  status      text not null default 'Pendente' check (status in ('Concluída', 'Em processamento', 'Pendente')),
  updated_at  timestamptz not null default now(),

  unique (id, office_id),
  unique (process_id),
  foreign key (process_id, office_id)
    references public.processes (id, office_id) on delete cascade
);

-- ... e vários itens (partes, valores, pedidos...). Cada item guarda DE ONDE
-- veio a informação: o documento e a página. É a regra de ouro do produto:
-- o advogado sempre consegue conferir a fonte.
create table public.analysis_items (
  id                  uuid primary key default gen_random_uuid(),
  office_id           uuid not null references public.offices (id) on delete cascade,
  analysis_id         uuid not null,
  section             text not null check (section in ('Partes', 'Valores', 'Pedidos', 'Argumentos', 'Decisões', 'Prazos')),
  position            integer not null,
  label               text not null,
  value               text not null,
  source_document_id  uuid,
  source_page         integer check (source_page > 0),

  foreign key (analysis_id, office_id)
    references public.analyses (id, office_id) on delete cascade,
  -- Se o documento for apagado, a informação continua, só perde a fonte.
  foreign key (source_document_id, office_id)
    references public.documents (id, office_id) on delete set null (source_document_id)
);
create index analysis_items_analysis_idx on public.analysis_items (analysis_id, position);


-- ---------------------------------------------------------------------
-- 7) CONSULTAS (perguntas e respostas sobre o processo)
-- ---------------------------------------------------------------------
create table public.consultations (
  id                  uuid primary key default gen_random_uuid(),
  office_id           uuid not null references public.offices (id) on delete cascade,
  process_id          uuid not null,
  profile_id          uuid,
  question            text not null,
  answer              text not null,
  source_document_id  uuid,
  source_page         integer check (source_page > 0),
  created_at          timestamptz not null default now(),

  foreign key (process_id, office_id)
    references public.processes (id, office_id) on delete cascade,
  foreign key (profile_id, office_id)
    references public.profiles (id, office_id) on delete set null (profile_id),
  foreign key (source_document_id, office_id)
    references public.documents (id, office_id) on delete set null (source_document_id)
);
create index consultations_process_idx on public.consultations (office_id, process_id, created_at);


-- ---------------------------------------------------------------------
-- 8) PRAZOS (os "próximos prazos" do dashboard)
-- ---------------------------------------------------------------------
create table public.deadlines (
  id          uuid primary key default gen_random_uuid(),
  office_id   uuid not null references public.offices (id) on delete cascade,
  process_id  uuid not null,
  title       text not null,
  due_date    date not null,
  created_at  timestamptz not null default now(),

  foreign key (process_id, office_id)
    references public.processes (id, office_id) on delete cascade
);
create index deadlines_due_idx on public.deadlines (office_id, due_date);


-- =====================================================================
-- SEGURANÇA: RLS (Row Level Security)
-- =====================================================================
--
-- Como funciona: com o RLS ligado, o banco só devolve (ou deixa alterar)
-- as linhas que passam por uma "política". Sem política, ninguém acessa nada.
-- É assim que "um escritório nunca vê os dados de outro" deixa de depender
-- da memória do programador: o próprio banco recusa.
--
-- As funções abaixo respondem: "quem está logado, de que escritório é e
-- qual é a função dele?". Ficam no schema "private" para não serem expostas
-- como endereços públicos da API do Supabase.
-- "security definer" faz a função ler "profiles" ignorando o RLS dela mesma
-- (senão a política de "profiles" chamaria a si própria em loop).

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create or replace function private.current_office_id()
returns uuid
language sql stable security definer set search_path = ''
as $$
  select office_id from public.profiles where auth_user_id = (select auth.uid())
$$;

create or replace function private.current_profile_id()
returns uuid
language sql stable security definer set search_path = ''
as $$
  select id from public.profiles where auth_user_id = (select auth.uid())
$$;

create or replace function private.current_role_name()
returns text
language sql stable security definer set search_path = ''
as $$
  select role from public.profiles where auth_user_id = (select auth.uid())
$$;

revoke all on function private.current_office_id()  from public;
revoke all on function private.current_profile_id() from public;
revoke all on function private.current_role_name()  from public;
grant execute on function private.current_office_id()  to authenticated;
grant execute on function private.current_profile_id() to authenticated;
grant execute on function private.current_role_name()  to authenticated;


-- Liga o RLS em todas as tabelas.
alter table public.offices         enable row level security;
alter table public.profiles        enable row level security;
alter table public.processes       enable row level security;
alter table public.documents       enable row level security;
alter table public.process_events  enable row level security;
alter table public.analyses        enable row level security;
alter table public.analysis_items  enable row level security;
alter table public.consultations   enable row level security;
alter table public.deadlines       enable row level security;


-- PERMISSÕES DO BANCO (o "porteiro" antes das políticas):
-- visitantes sem login (anon) não têm acesso a nada; quem está logado
-- (authenticated) pode tentar, e as políticas decidem linha a linha.
revoke all on all tables in schema public from anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
revoke insert, delete on public.offices from authenticated;  -- escritórios são criados por um fluxo seguro, na Fase 5


-- ---------------------------------------------------------------------
-- POLÍTICAS
-- Regras (espelham a tabela de permissões da tela "Equipe"):
--   Ver tudo do escritório ............ Administrador, Advogado, Estagiário
--   Enviar documentos e consultar ..... Administrador, Advogado, Estagiário
--   Cadastrar/editar processos e análises  Administrador, Advogado
--   Gerenciar equipe e configurações .. Administrador
-- ---------------------------------------------------------------------

-- offices: cada um vê só o seu; só o administrador altera.
create policy offices_select on public.offices for select to authenticated
  using (id = (select private.current_office_id()));
create policy offices_update on public.offices for update to authenticated
  using (id = (select private.current_office_id()) and (select private.current_role_name()) = 'Administrador')
  with check (id = (select private.current_office_id()));

-- profiles (equipe): todos veem a equipe; só o administrador gerencia.
create policy profiles_select on public.profiles for select to authenticated
  using (office_id = (select private.current_office_id()));
create policy profiles_insert on public.profiles for insert to authenticated
  with check (office_id = (select private.current_office_id()) and (select private.current_role_name()) = 'Administrador');
create policy profiles_update on public.profiles for update to authenticated
  using (office_id = (select private.current_office_id()) and (select private.current_role_name()) = 'Administrador')
  with check (office_id = (select private.current_office_id()));
create policy profiles_delete on public.profiles for delete to authenticated
  using (office_id = (select private.current_office_id()) and (select private.current_role_name()) = 'Administrador');

-- processes
create policy processes_select on public.processes for select to authenticated
  using (office_id = (select private.current_office_id()));
create policy processes_insert on public.processes for insert to authenticated
  with check (office_id = (select private.current_office_id()) and (select private.current_role_name()) in ('Administrador', 'Advogado'));
create policy processes_update on public.processes for update to authenticated
  using (office_id = (select private.current_office_id()) and (select private.current_role_name()) in ('Administrador', 'Advogado'))
  with check (office_id = (select private.current_office_id()));
create policy processes_delete on public.processes for delete to authenticated
  using (office_id = (select private.current_office_id()) and (select private.current_role_name()) = 'Administrador');

-- documents: todos enviam; só Administrador/Advogado alteram ou apagam.
create policy documents_select on public.documents for select to authenticated
  using (office_id = (select private.current_office_id()));
create policy documents_insert on public.documents for insert to authenticated
  with check (office_id = (select private.current_office_id()));
create policy documents_update on public.documents for update to authenticated
  using (office_id = (select private.current_office_id()) and (select private.current_role_name()) in ('Administrador', 'Advogado'))
  with check (office_id = (select private.current_office_id()));
create policy documents_delete on public.documents for delete to authenticated
  using (office_id = (select private.current_office_id()) and (select private.current_role_name()) in ('Administrador', 'Advogado'));

-- process_events (histórico)
create policy process_events_select on public.process_events for select to authenticated
  using (office_id = (select private.current_office_id()));
create policy process_events_write on public.process_events for all to authenticated
  using (office_id = (select private.current_office_id()) and (select private.current_role_name()) in ('Administrador', 'Advogado'))
  with check (office_id = (select private.current_office_id()) and (select private.current_role_name()) in ('Administrador', 'Advogado'));

-- analyses e analysis_items
create policy analyses_select on public.analyses for select to authenticated
  using (office_id = (select private.current_office_id()));
create policy analyses_write on public.analyses for all to authenticated
  using (office_id = (select private.current_office_id()) and (select private.current_role_name()) in ('Administrador', 'Advogado'))
  with check (office_id = (select private.current_office_id()) and (select private.current_role_name()) in ('Administrador', 'Advogado'));

create policy analysis_items_select on public.analysis_items for select to authenticated
  using (office_id = (select private.current_office_id()));
create policy analysis_items_write on public.analysis_items for all to authenticated
  using (office_id = (select private.current_office_id()) and (select private.current_role_name()) in ('Administrador', 'Advogado'))
  with check (office_id = (select private.current_office_id()) and (select private.current_role_name()) in ('Administrador', 'Advogado'));

-- consultations: todos podem consultar, mas só registram consultas em nome próprio.
create policy consultations_select on public.consultations for select to authenticated
  using (office_id = (select private.current_office_id()));
create policy consultations_insert on public.consultations for insert to authenticated
  with check (office_id = (select private.current_office_id()) and profile_id = (select private.current_profile_id()));

-- deadlines
create policy deadlines_select on public.deadlines for select to authenticated
  using (office_id = (select private.current_office_id()));
create policy deadlines_write on public.deadlines for all to authenticated
  using (office_id = (select private.current_office_id()) and (select private.current_role_name()) in ('Administrador', 'Advogado'))
  with check (office_id = (select private.current_office_id()) and (select private.current_role_name()) in ('Administrador', 'Advogado'));


-- =====================================================================
-- Para recomeçar do zero (APAGA TUDO; só use em desenvolvimento):
--   drop table if exists public.deadlines, public.consultations, public.analysis_items,
--     public.analyses, public.process_events, public.documents, public.processes,
--     public.profiles, public.offices cascade;
--   drop schema if exists private cascade;
-- =====================================================================
