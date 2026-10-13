-- =====================================================================
-- LexIA — Fase 11: perguntas sobre processos
-- Rode UMA vez no SQL Editor, ANTES de subir o código da Fase 11 no GitHub.
-- Pode rodar de novo sem problema.
--
-- O que faz:
--   Acrescenta em consultations a coluna sources: a lista das fontes de cada resposta (até 5), no
--   formato [{"documentId": "...", "page": 3, "quote": "trecho literal"}]. Até agora a tabela guardava
--   uma fonte só (source_document_id e source_page); a resposta pode vir de mais de um lugar.
--   As colunas antigas continuam existindo (guardam a primeira fonte).
--
-- As regras de acesso (RLS) de consultations já existem desde o 01 e não mudam: todos do escritório
-- veem; cada pessoa só registra consultas em nome próprio; ninguém edita ou apaga consulta.
-- =====================================================================

alter table public.consultations
  add column if not exists sources jsonb not null default '[]'::jsonb
  check (jsonb_typeof(sources) = 'array' and jsonb_array_length(sources) <= 5);

-- Conferência: deve aparecer UMA linha, com sources.
select column_name, data_type
from information_schema.columns
where table_schema = 'public' and table_name = 'consultations' and column_name = 'sources';
