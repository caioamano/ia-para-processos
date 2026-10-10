-- =====================================================================
-- LexIA — Fase 8: armazenamento dos PDFs (Supabase Storage)
-- Rode UMA vez no SQL Editor, depois do 01. Pode rodar de novo sem problema.
--
-- O que faz:
--   1. cria o bucket PRIVADO "documents" (só PDF, até 50 MB por arquivo);
--   2. cria as regras (RLS) do Storage: cada arquivo fica em
--        <id do escritório>/<id do processo>/<id do documento>.pdf
--      e só quem é do escritório dono da primeira pasta consegue ver, enviar
--      ou (Administrador/Advogado) excluir.
--
-- A coluna documents.storage_path já existe desde o 01.
-- =====================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('documents', 'documents', false, 52428800, array['application/pdf'])
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists documents_files_select on storage.objects;
drop policy if exists documents_files_insert on storage.objects;
drop policy if exists documents_files_delete on storage.objects;

-- Ver / baixar: qualquer pessoa do escritório dono do arquivo.
create policy documents_files_select on storage.objects for select to authenticated
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = (select private.current_office_id())::text
  );

-- Enviar: qualquer pessoa do escritório, só para a pasta do próprio escritório.
create policy documents_files_insert on storage.objects for insert to authenticated
  with check (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = (select private.current_office_id())::text
  );

-- Excluir: só Administrador e Advogado, só no próprio escritório.
create policy documents_files_delete on storage.objects for delete to authenticated
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = (select private.current_office_id())::text
    and (select private.current_role_name()) in ('Administrador', 'Advogado')
  );

-- Não há regra de UPDATE de propósito: ninguém troca o conteúdo de um arquivo já enviado
-- (o envio usa upsert=false). Sem regra, o RLS nega.

-- Conferência: deve mostrar o bucket privado e as 3 regras.
select
  (select public from storage.buckets where id = 'documents')                          as bucket_publico,
  (select file_size_limit from storage.buckets where id = 'documents')                 as limite_bytes,
  (select count(*) from pg_policies where schemaname = 'storage'
     and tablename = 'objects' and policyname like 'documents_files_%')                as regras;
