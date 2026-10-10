-- =====================================================================
-- LexIA — Fase 10B: análise de documentos
-- Rode UMA vez no SQL Editor, ANTES de subir o código da 10B no GitHub.
-- Pode rodar de novo sem problema.
--
-- O que faz:
--   Acrescenta em analysis_items a coluna source_quote: o TRECHO LITERAL do documento que
--   comprova cada item da análise (até 300 caracteres). Serve para o advogado conferir a fonte e,
--   mais adiante, para verificar se a página indicada está certa.
--
-- As regras de acesso (RLS) de analyses e analysis_items já existem desde o 01 e não mudam:
-- todos do escritório veem; só Administrador e Advogado gravam.
-- =====================================================================

alter table public.analysis_items
  add column if not exists source_quote text
  check (source_quote is null or char_length(source_quote) <= 300);

-- Conferência: deve aparecer UMA linha, com source_quote.
select column_name, data_type
from information_schema.columns
where table_schema = 'public' and table_name = 'analysis_items' and column_name = 'source_quote';
