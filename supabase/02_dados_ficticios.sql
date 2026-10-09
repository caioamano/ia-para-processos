-- =====================================================================
-- LexIA — Fase 4: dados FICTÍCIOS (escritório Silva & Associados)
-- Rode DEPOIS do 01_schema.sql. Nenhum dado aqui é real.
-- Pode rodar de novo quando quiser: ele apaga o escritório fictício e recria tudo.
--
-- Como funciona: abaixo vai a lista dos 128 processos. O restante (documentos,
-- histórico, análises e consultas) é gerado pelo próprio SQL a partir dessa lista,
-- com as mesmas regras dos dados que as telas do site já usam (lib/mock-*.ts).
-- No fim, uma consulta de conferência mostra os totais.
-- =====================================================================
-- ATENÇÃO (depois da Fase 5): NÃO rode este script de novo sem necessidade. Ele apaga o
-- escritório Silva & Associados e recria tudo, o que DESFAZ o vínculo do seu login com o
-- perfil Caio Henrique (você teria que refazer o vínculo no SQL Editor).
-- =====================================================================

-- Recomeça: apagar o escritório apaga em cascata tudo que pertence a ele.
delete from public.offices where id = 'e9184ec0-1771-b6a1-0bb0-506f9c19dab3';

insert into public.offices (id, name) values ('e9184ec0-1771-b6a1-0bb0-506f9c19dab3', 'Silva & Associados');

-- Equipe. auth_user_id fica vazio até cada pessoa criar a conta (Fase 5).
insert into public.profiles (id, office_id, name, email, role, status, last_access_at) values
  (md5('lexia:profile:user-caio')::uuid, 'e9184ec0-1771-b6a1-0bb0-506f9c19dab3', 'Caio Henrique', 'caio@silvaassociados.example', 'Administrador', 'Ativo', '2026-10-08 09:42:00-03'),
  (md5('lexia:profile:user-ana')::uuid, 'e9184ec0-1771-b6a1-0bb0-506f9c19dab3', 'Ana Beatriz', 'ana.beatriz@silvaassociados.example', 'Advogado', 'Ativo', '2026-10-07 16:18:00-03'),
  (md5('lexia:profile:user-lucas')::uuid, 'e9184ec0-1771-b6a1-0bb0-506f9c19dab3', 'Lucas Mendes', 'lucas.mendes@silvaassociados.example', 'Advogado', 'Ativo', '2026-09-12 12:00:00-03'),
  (md5('lexia:profile:user-marina')::uuid, 'e9184ec0-1771-b6a1-0bb0-506f9c19dab3', 'Marina Rocha', 'marina.rocha@silvaassociados.example', 'Estagiário', 'Ativo', '2026-09-11 12:00:00-03'),
  (md5('lexia:profile:user-paulo')::uuid, 'e9184ec0-1771-b6a1-0bb0-506f9c19dab3', 'Paulo Siqueira', 'paulo.siqueira@silvaassociados.example', 'Estagiário', 'Convite pendente', null);

-- Lista base dos processos. Esta tabela temporária (some ao fim da sessão) guarda
-- o número de ordem "n", usado pelas fórmulas que variam os dados de processo para processo.
create temp table seed_base (
  n int, number text, client text, type text, status text, responsible text, updated_at timestamptz
);
insert into seed_base values
  (1, '0001234-56.2026.8.16.0001', 'Almeida Comércio Ltda.', 'Cível', 'Em andamento', 'Caio Henrique', '2026-10-08 09:42:00-03'),
  (2, '0009876-12.2025.8.26.0100', 'Mariana Costa', 'Trabalhista', 'Em análise', 'Ana Beatriz', '2026-10-07 16:18:00-03'),
  (3, '0014567-89.2024.8.16.0030', 'Grupo Horizonte S.A.', 'Empresarial', 'Pendente', 'Caio Henrique', '2026-09-18 12:00:00-03'),
  (4, '0007821-44.2026.8.19.0001', 'Rafael Nogueira', 'Cível', 'Concluído', 'Lucas Mendes', '2026-09-16 12:00:00-03'),
  (5, '0023412-20.2025.8.16.0001', 'Construtora Vale Azul', 'Tributário', 'Em andamento', 'Ana Beatriz', '2026-09-14 12:00:00-03'),
  (6, '1289626-22.2023.8.16.0001', 'Transportes Rota Sul S.A.', 'Empresarial', 'Concluído', 'Caio Henrique', '2026-09-13 12:00:00-03'),
  (7, '1337897-39.2024.5.09.0010', 'Oficina Mecânica Ferraz', 'Trabalhista', 'Em andamento', 'Ana Beatriz', '2026-09-13 12:00:00-03'),
  (8, '1386168-56.2025.8.16.0001', 'João Pedro Sampaio', 'Cível', 'Pendente', 'Lucas Mendes', '2026-09-12 12:00:00-03'),
  (9, '1434439-73.2026.8.26.0100', 'Indústria Metalúrgica Brasil', 'Tributário', 'Concluído', 'Caio Henrique', '2026-09-11 12:00:00-03'),
  (10, '1482710-90.2022.8.16.0001', 'Farmácia Bom Remédio Ltda.', 'Empresarial', 'Em andamento', 'Ana Beatriz', '2026-09-10 12:00:00-03'),
  (11, '1530981-17.2023.5.09.0010', 'Marcos Vinícius Prado', 'Trabalhista', 'Em análise', 'Lucas Mendes', '2026-09-09 12:00:00-03'),
  (12, '1579252-34.2024.8.16.0001', 'Clínica Vida Plena', 'Cível', 'Concluído', 'Caio Henrique', '2026-09-08 12:00:00-03'),
  (13, '1627523-51.2025.8.26.0100', 'Distribuidora Alvorada Ltda.', 'Tributário', 'Em andamento', 'Ana Beatriz', '2026-09-07 12:00:00-03'),
  (14, '1675794-68.2026.8.16.0001', 'Fernanda Albuquerque', 'Empresarial', 'Em análise', 'Lucas Mendes', '2026-09-06 12:00:00-03'),
  (15, '1724065-85.2022.5.09.0010', 'Ricardo Teixeira Neto', 'Trabalhista', 'Pendente', 'Caio Henrique', '2026-09-05 12:00:00-03'),
  (16, '1772336-12.2023.8.16.0001', 'Padaria Santa Clara Ltda.', 'Cível', 'Em andamento', 'Ana Beatriz', '2026-09-04 12:00:00-03'),
  (17, '1820607-29.2024.8.26.0100', 'Helena Duarte Carvalho', 'Tributário', 'Em análise', 'Lucas Mendes', '2026-09-04 12:00:00-03'),
  (18, '1868878-46.2025.8.16.0001', 'Beatriz Lima Montenegro', 'Empresarial', 'Pendente', 'Caio Henrique', '2026-09-03 12:00:00-03'),
  (19, '1917149-63.2026.5.09.0010', 'Escola Novo Horizonte', 'Trabalhista', 'Concluído', 'Ana Beatriz', '2026-09-02 12:00:00-03'),
  (20, '1965420-80.2022.8.16.0001', 'Condomínio Residencial Aurora', 'Cível', 'Em análise', 'Lucas Mendes', '2026-09-01 12:00:00-03'),
  (21, '2013691-97.2023.8.26.0100', 'Luciana Ferreira Souza', 'Tributário', 'Pendente', 'Caio Henrique', '2026-08-31 12:00:00-03'),
  (22, '2061962-24.2024.8.16.0001', 'Transportes Rota Sul S.A.', 'Empresarial', 'Concluído', 'Ana Beatriz', '2026-08-30 12:00:00-03'),
  (23, '2110233-41.2025.5.09.0010', 'Oficina Mecânica Ferraz', 'Trabalhista', 'Em andamento', 'Lucas Mendes', '2026-08-29 12:00:00-03'),
  (24, '2158504-58.2026.8.16.0001', 'João Pedro Sampaio', 'Cível', 'Pendente', 'Caio Henrique', '2026-08-28 12:00:00-03'),
  (25, '2206775-75.2022.8.26.0100', 'Indústria Metalúrgica Brasil', 'Tributário', 'Concluído', 'Ana Beatriz', '2026-08-27 12:00:00-03'),
  (26, '2255046-92.2023.8.16.0001', 'Farmácia Bom Remédio Ltda.', 'Empresarial', 'Em andamento', 'Lucas Mendes', '2026-08-26 12:00:00-03'),
  (27, '2303317-19.2024.5.09.0010', 'Marcos Vinícius Prado', 'Trabalhista', 'Em análise', 'Caio Henrique', '2026-08-26 12:00:00-03'),
  (28, '2351588-36.2025.8.16.0001', 'Clínica Vida Plena', 'Cível', 'Concluído', 'Ana Beatriz', '2026-08-25 12:00:00-03'),
  (29, '2399859-53.2026.8.26.0100', 'Distribuidora Alvorada Ltda.', 'Tributário', 'Em andamento', 'Lucas Mendes', '2026-08-24 12:00:00-03'),
  (30, '2448130-70.2022.8.16.0001', 'Fernanda Albuquerque', 'Empresarial', 'Em análise', 'Caio Henrique', '2026-08-23 12:00:00-03'),
  (31, '2496401-87.2023.5.09.0010', 'Ricardo Teixeira Neto', 'Trabalhista', 'Pendente', 'Ana Beatriz', '2026-08-22 12:00:00-03'),
  (32, '2544672-14.2024.8.16.0001', 'Padaria Santa Clara Ltda.', 'Cível', 'Em andamento', 'Lucas Mendes', '2026-08-21 12:00:00-03'),
  (33, '2592943-31.2025.8.26.0100', 'Helena Duarte Carvalho', 'Tributário', 'Em análise', 'Caio Henrique', '2026-08-20 12:00:00-03'),
  (34, '2641214-48.2026.8.16.0001', 'Beatriz Lima Montenegro', 'Empresarial', 'Pendente', 'Ana Beatriz', '2026-08-19 12:00:00-03'),
  (35, '2689485-65.2022.5.09.0010', 'Escola Novo Horizonte', 'Trabalhista', 'Concluído', 'Lucas Mendes', '2026-08-18 12:00:00-03'),
  (36, '2737756-82.2023.8.16.0001', 'Condomínio Residencial Aurora', 'Cível', 'Em análise', 'Caio Henrique', '2026-08-17 12:00:00-03'),
  (37, '2786027-99.2024.8.26.0100', 'Luciana Ferreira Souza', 'Tributário', 'Pendente', 'Ana Beatriz', '2026-08-17 12:00:00-03'),
  (38, '2834298-26.2025.8.16.0001', 'Transportes Rota Sul S.A.', 'Empresarial', 'Concluído', 'Lucas Mendes', '2026-08-16 12:00:00-03'),
  (39, '2882569-43.2026.5.09.0010', 'Oficina Mecânica Ferraz', 'Trabalhista', 'Em andamento', 'Caio Henrique', '2026-08-15 12:00:00-03'),
  (40, '2930840-60.2022.8.16.0001', 'João Pedro Sampaio', 'Cível', 'Pendente', 'Ana Beatriz', '2026-08-14 12:00:00-03'),
  (41, '2979111-77.2023.8.26.0100', 'Indústria Metalúrgica Brasil', 'Tributário', 'Concluído', 'Lucas Mendes', '2026-08-13 12:00:00-03'),
  (42, '3027382-94.2024.8.16.0001', 'Farmácia Bom Remédio Ltda.', 'Empresarial', 'Em andamento', 'Caio Henrique', '2026-08-12 12:00:00-03'),
  (43, '3075653-21.2025.5.09.0010', 'Marcos Vinícius Prado', 'Trabalhista', 'Em análise', 'Ana Beatriz', '2026-08-11 12:00:00-03'),
  (44, '3123924-38.2026.8.16.0001', 'Clínica Vida Plena', 'Cível', 'Concluído', 'Lucas Mendes', '2026-08-10 12:00:00-03'),
  (45, '3172195-55.2022.8.26.0100', 'Distribuidora Alvorada Ltda.', 'Tributário', 'Em andamento', 'Caio Henrique', '2026-08-09 12:00:00-03'),
  (46, '3220466-72.2023.8.16.0001', 'Fernanda Albuquerque', 'Empresarial', 'Em análise', 'Ana Beatriz', '2026-08-08 12:00:00-03'),
  (47, '3268737-89.2024.5.09.0010', 'Ricardo Teixeira Neto', 'Trabalhista', 'Pendente', 'Lucas Mendes', '2026-08-08 12:00:00-03'),
  (48, '3317008-16.2025.8.16.0001', 'Padaria Santa Clara Ltda.', 'Cível', 'Em andamento', 'Caio Henrique', '2026-08-07 12:00:00-03'),
  (49, '3365279-33.2026.8.26.0100', 'Helena Duarte Carvalho', 'Tributário', 'Em análise', 'Ana Beatriz', '2026-08-06 12:00:00-03'),
  (50, '3413550-50.2022.8.16.0001', 'Beatriz Lima Montenegro', 'Empresarial', 'Pendente', 'Lucas Mendes', '2026-08-05 12:00:00-03'),
  (51, '3461821-67.2023.5.09.0010', 'Escola Novo Horizonte', 'Trabalhista', 'Concluído', 'Caio Henrique', '2026-08-04 12:00:00-03'),
  (52, '3510092-84.2024.8.16.0001', 'Condomínio Residencial Aurora', 'Cível', 'Em análise', 'Ana Beatriz', '2026-08-03 12:00:00-03'),
  (53, '3558363-11.2025.8.26.0100', 'Luciana Ferreira Souza', 'Tributário', 'Pendente', 'Lucas Mendes', '2026-08-02 12:00:00-03'),
  (54, '3606634-28.2026.8.16.0001', 'Transportes Rota Sul S.A.', 'Empresarial', 'Concluído', 'Caio Henrique', '2026-08-01 12:00:00-03'),
  (55, '3654905-45.2022.5.09.0010', 'Oficina Mecânica Ferraz', 'Trabalhista', 'Em andamento', 'Ana Beatriz', '2026-07-31 12:00:00-03'),
  (56, '3703176-62.2023.8.16.0001', 'João Pedro Sampaio', 'Cível', 'Pendente', 'Lucas Mendes', '2026-07-30 12:00:00-03'),
  (57, '3751447-79.2024.8.26.0100', 'Indústria Metalúrgica Brasil', 'Tributário', 'Concluído', 'Caio Henrique', '2026-07-30 12:00:00-03'),
  (58, '3799718-96.2025.8.16.0001', 'Farmácia Bom Remédio Ltda.', 'Empresarial', 'Em andamento', 'Ana Beatriz', '2026-07-29 12:00:00-03'),
  (59, '3847989-23.2026.5.09.0010', 'Marcos Vinícius Prado', 'Trabalhista', 'Em análise', 'Lucas Mendes', '2026-07-28 12:00:00-03'),
  (60, '3896260-40.2022.8.16.0001', 'Clínica Vida Plena', 'Cível', 'Concluído', 'Caio Henrique', '2026-07-27 12:00:00-03'),
  (61, '3944531-57.2023.8.26.0100', 'Distribuidora Alvorada Ltda.', 'Tributário', 'Em andamento', 'Ana Beatriz', '2026-07-26 12:00:00-03'),
  (62, '3992802-74.2024.8.16.0001', 'Fernanda Albuquerque', 'Empresarial', 'Em análise', 'Lucas Mendes', '2026-07-25 12:00:00-03'),
  (63, '4041073-91.2025.5.09.0010', 'Ricardo Teixeira Neto', 'Trabalhista', 'Pendente', 'Caio Henrique', '2026-07-24 12:00:00-03'),
  (64, '4089344-18.2026.8.16.0001', 'Padaria Santa Clara Ltda.', 'Cível', 'Em andamento', 'Ana Beatriz', '2026-07-23 12:00:00-03'),
  (65, '4137615-35.2022.8.26.0100', 'Helena Duarte Carvalho', 'Tributário', 'Em análise', 'Lucas Mendes', '2026-07-22 12:00:00-03'),
  (66, '4185886-52.2023.8.16.0001', 'Beatriz Lima Montenegro', 'Empresarial', 'Pendente', 'Caio Henrique', '2026-07-21 12:00:00-03'),
  (67, '4234157-69.2024.5.09.0010', 'Escola Novo Horizonte', 'Trabalhista', 'Concluído', 'Ana Beatriz', '2026-07-21 12:00:00-03'),
  (68, '4282428-86.2025.8.16.0001', 'Condomínio Residencial Aurora', 'Cível', 'Em análise', 'Lucas Mendes', '2026-07-20 12:00:00-03'),
  (69, '4330699-13.2026.8.26.0100', 'Luciana Ferreira Souza', 'Tributário', 'Pendente', 'Caio Henrique', '2026-07-19 12:00:00-03'),
  (70, '4378970-30.2022.8.16.0001', 'Transportes Rota Sul S.A.', 'Empresarial', 'Concluído', 'Ana Beatriz', '2026-07-18 12:00:00-03'),
  (71, '4427241-47.2023.5.09.0010', 'Oficina Mecânica Ferraz', 'Trabalhista', 'Em andamento', 'Lucas Mendes', '2026-07-17 12:00:00-03'),
  (72, '4475512-64.2024.8.16.0001', 'João Pedro Sampaio', 'Cível', 'Pendente', 'Caio Henrique', '2026-07-16 12:00:00-03'),
  (73, '4523783-81.2025.8.26.0100', 'Indústria Metalúrgica Brasil', 'Tributário', 'Concluído', 'Ana Beatriz', '2026-07-15 12:00:00-03'),
  (74, '4572054-98.2026.8.16.0001', 'Farmácia Bom Remédio Ltda.', 'Empresarial', 'Em andamento', 'Lucas Mendes', '2026-07-14 12:00:00-03'),
  (75, '4620325-25.2022.5.09.0010', 'Marcos Vinícius Prado', 'Trabalhista', 'Em análise', 'Caio Henrique', '2026-07-13 12:00:00-03'),
  (76, '4668596-42.2023.8.16.0001', 'Clínica Vida Plena', 'Cível', 'Concluído', 'Ana Beatriz', '2026-07-12 12:00:00-03'),
  (77, '4716867-59.2024.8.26.0100', 'Distribuidora Alvorada Ltda.', 'Tributário', 'Em andamento', 'Lucas Mendes', '2026-07-12 12:00:00-03'),
  (78, '4765138-76.2025.8.16.0001', 'Fernanda Albuquerque', 'Empresarial', 'Em análise', 'Caio Henrique', '2026-07-11 12:00:00-03'),
  (79, '4813409-93.2026.5.09.0010', 'Ricardo Teixeira Neto', 'Trabalhista', 'Pendente', 'Ana Beatriz', '2026-07-10 12:00:00-03'),
  (80, '4861680-20.2022.8.16.0001', 'Padaria Santa Clara Ltda.', 'Cível', 'Em andamento', 'Lucas Mendes', '2026-07-09 12:00:00-03'),
  (81, '4909951-37.2023.8.26.0100', 'Helena Duarte Carvalho', 'Tributário', 'Em análise', 'Caio Henrique', '2026-07-08 12:00:00-03'),
  (82, '4958222-54.2024.8.16.0001', 'Beatriz Lima Montenegro', 'Empresarial', 'Pendente', 'Ana Beatriz', '2026-07-07 12:00:00-03'),
  (83, '5006493-71.2025.5.09.0010', 'Escola Novo Horizonte', 'Trabalhista', 'Concluído', 'Lucas Mendes', '2026-07-06 12:00:00-03'),
  (84, '5054764-88.2026.8.16.0001', 'Condomínio Residencial Aurora', 'Cível', 'Em análise', 'Caio Henrique', '2026-07-05 12:00:00-03'),
  (85, '5103035-15.2022.8.26.0100', 'Luciana Ferreira Souza', 'Tributário', 'Pendente', 'Ana Beatriz', '2026-07-04 12:00:00-03'),
  (86, '5151306-32.2023.8.16.0001', 'Transportes Rota Sul S.A.', 'Empresarial', 'Concluído', 'Lucas Mendes', '2026-07-03 12:00:00-03'),
  (87, '5199577-49.2024.5.09.0010', 'Oficina Mecânica Ferraz', 'Trabalhista', 'Em andamento', 'Caio Henrique', '2026-07-03 12:00:00-03'),
  (88, '5247848-66.2025.8.16.0001', 'João Pedro Sampaio', 'Cível', 'Pendente', 'Ana Beatriz', '2026-07-02 12:00:00-03'),
  (89, '5296119-83.2026.8.26.0100', 'Indústria Metalúrgica Brasil', 'Tributário', 'Concluído', 'Lucas Mendes', '2026-07-01 12:00:00-03'),
  (90, '5344390-10.2022.8.16.0001', 'Farmácia Bom Remédio Ltda.', 'Empresarial', 'Em andamento', 'Caio Henrique', '2026-06-30 12:00:00-03'),
  (91, '5392661-27.2023.5.09.0010', 'Marcos Vinícius Prado', 'Trabalhista', 'Em análise', 'Ana Beatriz', '2026-06-29 12:00:00-03'),
  (92, '5440932-44.2024.8.16.0001', 'Clínica Vida Plena', 'Cível', 'Concluído', 'Lucas Mendes', '2026-06-28 12:00:00-03'),
  (93, '5489203-61.2025.8.26.0100', 'Distribuidora Alvorada Ltda.', 'Tributário', 'Em andamento', 'Caio Henrique', '2026-06-27 12:00:00-03'),
  (94, '5537474-78.2026.8.16.0001', 'Fernanda Albuquerque', 'Empresarial', 'Em análise', 'Ana Beatriz', '2026-06-26 12:00:00-03'),
  (95, '5585745-95.2022.5.09.0010', 'Ricardo Teixeira Neto', 'Trabalhista', 'Pendente', 'Lucas Mendes', '2026-06-25 12:00:00-03'),
  (96, '5634016-22.2023.8.16.0001', 'Padaria Santa Clara Ltda.', 'Cível', 'Em andamento', 'Caio Henrique', '2026-06-24 12:00:00-03'),
  (97, '5682287-39.2024.8.26.0100', 'Helena Duarte Carvalho', 'Tributário', 'Em análise', 'Ana Beatriz', '2026-06-24 12:00:00-03'),
  (98, '5730558-56.2025.8.16.0001', 'Beatriz Lima Montenegro', 'Empresarial', 'Pendente', 'Lucas Mendes', '2026-06-23 12:00:00-03'),
  (99, '5778829-73.2026.5.09.0010', 'Escola Novo Horizonte', 'Trabalhista', 'Concluído', 'Caio Henrique', '2026-06-22 12:00:00-03'),
  (100, '5827100-90.2022.8.16.0001', 'Condomínio Residencial Aurora', 'Cível', 'Em análise', 'Ana Beatriz', '2026-06-21 12:00:00-03'),
  (101, '5875371-17.2023.8.26.0100', 'Luciana Ferreira Souza', 'Tributário', 'Pendente', 'Lucas Mendes', '2026-06-20 12:00:00-03'),
  (102, '5923642-34.2024.8.16.0001', 'Transportes Rota Sul S.A.', 'Empresarial', 'Concluído', 'Caio Henrique', '2026-06-19 12:00:00-03'),
  (103, '5971913-51.2025.5.09.0010', 'Oficina Mecânica Ferraz', 'Trabalhista', 'Em andamento', 'Ana Beatriz', '2026-06-18 12:00:00-03'),
  (104, '6020184-68.2026.8.16.0001', 'João Pedro Sampaio', 'Cível', 'Pendente', 'Lucas Mendes', '2026-06-17 12:00:00-03'),
  (105, '6068455-85.2022.8.26.0100', 'Indústria Metalúrgica Brasil', 'Tributário', 'Concluído', 'Caio Henrique', '2026-06-16 12:00:00-03'),
  (106, '6116726-12.2023.8.16.0001', 'Farmácia Bom Remédio Ltda.', 'Empresarial', 'Em andamento', 'Ana Beatriz', '2026-06-15 12:00:00-03'),
  (107, '6164997-29.2024.5.09.0010', 'Marcos Vinícius Prado', 'Trabalhista', 'Em análise', 'Lucas Mendes', '2026-06-15 12:00:00-03'),
  (108, '6213268-46.2025.8.16.0001', 'Clínica Vida Plena', 'Cível', 'Concluído', 'Caio Henrique', '2026-06-14 12:00:00-03'),
  (109, '6261539-63.2026.8.26.0100', 'Distribuidora Alvorada Ltda.', 'Tributário', 'Em andamento', 'Ana Beatriz', '2026-06-13 12:00:00-03'),
  (110, '6309810-80.2022.8.16.0001', 'Fernanda Albuquerque', 'Empresarial', 'Em análise', 'Lucas Mendes', '2026-06-12 12:00:00-03'),
  (111, '6358081-97.2023.5.09.0010', 'Ricardo Teixeira Neto', 'Trabalhista', 'Pendente', 'Caio Henrique', '2026-06-11 12:00:00-03'),
  (112, '6406352-24.2024.8.16.0001', 'Padaria Santa Clara Ltda.', 'Cível', 'Em andamento', 'Ana Beatriz', '2026-06-10 12:00:00-03'),
  (113, '6454623-41.2025.8.26.0100', 'Helena Duarte Carvalho', 'Tributário', 'Em análise', 'Lucas Mendes', '2026-06-09 12:00:00-03'),
  (114, '6502894-58.2026.8.16.0001', 'Beatriz Lima Montenegro', 'Empresarial', 'Pendente', 'Caio Henrique', '2026-06-08 12:00:00-03'),
  (115, '6551165-75.2022.5.09.0010', 'Escola Novo Horizonte', 'Trabalhista', 'Concluído', 'Ana Beatriz', '2026-06-07 12:00:00-03'),
  (116, '6599436-92.2023.8.16.0001', 'Condomínio Residencial Aurora', 'Cível', 'Em análise', 'Lucas Mendes', '2026-06-06 12:00:00-03'),
  (117, '6647707-19.2024.8.26.0100', 'Luciana Ferreira Souza', 'Tributário', 'Pendente', 'Caio Henrique', '2026-06-06 12:00:00-03'),
  (118, '6695978-36.2025.8.16.0001', 'Transportes Rota Sul S.A.', 'Empresarial', 'Concluído', 'Ana Beatriz', '2026-06-05 12:00:00-03'),
  (119, '6744249-53.2026.5.09.0010', 'Oficina Mecânica Ferraz', 'Trabalhista', 'Em andamento', 'Lucas Mendes', '2026-06-04 12:00:00-03'),
  (120, '6792520-70.2022.8.16.0001', 'João Pedro Sampaio', 'Cível', 'Pendente', 'Caio Henrique', '2026-06-03 12:00:00-03'),
  (121, '6840791-87.2023.8.26.0100', 'Indústria Metalúrgica Brasil', 'Tributário', 'Concluído', 'Ana Beatriz', '2026-06-02 12:00:00-03'),
  (122, '6889062-14.2024.8.16.0001', 'Farmácia Bom Remédio Ltda.', 'Empresarial', 'Em andamento', 'Lucas Mendes', '2026-06-01 12:00:00-03'),
  (123, '6937333-31.2025.5.09.0010', 'Marcos Vinícius Prado', 'Trabalhista', 'Em análise', 'Caio Henrique', '2026-05-31 12:00:00-03'),
  (124, '6985604-48.2026.8.16.0001', 'Clínica Vida Plena', 'Cível', 'Concluído', 'Ana Beatriz', '2026-05-30 12:00:00-03'),
  (125, '7033875-65.2022.8.26.0100', 'Distribuidora Alvorada Ltda.', 'Tributário', 'Em andamento', 'Lucas Mendes', '2026-05-29 12:00:00-03'),
  (126, '7082146-82.2023.8.16.0001', 'Fernanda Albuquerque', 'Empresarial', 'Em análise', 'Caio Henrique', '2026-05-28 12:00:00-03'),
  (127, '7130417-99.2024.5.09.0010', 'Ricardo Teixeira Neto', 'Trabalhista', 'Pendente', 'Ana Beatriz', '2026-05-28 12:00:00-03'),
  (128, '7178688-26.2025.8.16.0001', 'Padaria Santa Clara Ltda.', 'Cível', 'Em andamento', 'Lucas Mendes', '2026-05-27 12:00:00-03');

-- Completa cada processo com vara, valor da causa, parte contrária e data de distribuição.
-- A "data base" de cada processo é 13/09/2026 menos (n mod 20) dias.
create temp table seed_processes as
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
from seed_base b;

-- Valor em reais no formato brasileiro (R$ 85.000,00), para os textos da análise.
create function pg_temp.brl(v numeric) returns text language sql immutable as
$$ select 'R$' || chr(160) || translate(to_char(v, 'FM999,999,999.00'), ',.', '.,') $$;

insert into public.processes (id, office_id, number, client, type, status, responsible_id,
                              court, case_value, counterparty, distributed_at, created_at, updated_at)
select md5('lexia:proc-' || p.n)::uuid, 'e9184ec0-1771-b6a1-0bb0-506f9c19dab3', p.number, p.client, p.type, p.status, r.id,
       p.court, p.case_value, p.counterparty, p.base_date - 70,
       (p.base_date - 70)::timestamp at time zone 'America/Sao_Paulo', p.updated_at
from seed_processes p
join public.profiles r on r.office_id = 'e9184ec0-1771-b6a1-0bb0-506f9c19dab3' and r.name = p.responsible;

-- Prazos do dashboard.
insert into public.deadlines (id, office_id, process_id, title, due_date) values
  (md5('lexia:deadline-1')::uuid, 'e9184ec0-1771-b6a1-0bb0-506f9c19dab3', md5('lexia:proc-1')::uuid, 'Manifestação processual', '2026-10-08'),
  (md5('lexia:deadline-2')::uuid, 'e9184ec0-1771-b6a1-0bb0-506f9c19dab3', md5('lexia:proc-2')::uuid, 'Audiência de conciliação', '2026-10-12'),
  (md5('lexia:deadline-3')::uuid, 'e9184ec0-1771-b6a1-0bb0-506f9c19dab3', md5('lexia:proc-3')::uuid, 'Prazo para recurso', '2026-10-18');

-- Documentos: 6 por processo. A situação deles depende da situação do processo.
insert into public.documents (id, office_id, process_id, name, file_name, pages, size_bytes, status, uploaded_at)
select md5('lexia:doc-' || p.n || '-' || t.idx)::uuid, 'e9184ec0-1771-b6a1-0bb0-506f9c19dab3', md5('lexia:proc-' || p.n)::uuid,
       t.name, t.file_name, t.pages, round(t.pages * 0.12 * 1048576),
       case p.status
         when 'Concluído'    then 'Analisado'
         when 'Em andamento' then case when t.idx <= 5 then 'Analisado' else 'Em processamento' end
         when 'Em análise'   then case when t.idx <= 3 then 'Analisado' when t.idx <= 5 then 'Em processamento' else 'Pendente' end
         else                     case when t.idx <= 2 then 'Analisado' else 'Pendente' end
       end,
       (p.base_date - t.days_ago)::timestamp at time zone 'America/Sao_Paulo' + interval '12 hours'
from seed_processes p
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
select md5('lexia:event-' || p.n || '-' || t.idx)::uuid, 'e9184ec0-1771-b6a1-0bb0-506f9c19dab3', md5('lexia:proc-' || p.n)::uuid,
       p.base_date - t.days_ago, t.title, t.description
from seed_processes p
cross join lateral (values
  (1, 'Despacho',               'Intimação da parte autora para manifestação no prazo de 15 dias.', 0),
  (2, 'Juntada de contestação', 'Contestação apresentada por ' || p.counterparty || '.',            9),
  (3, 'Citação',                'Parte ré citada para apresentar defesa.',                         24),
  (4, 'Despacho inicial',       'Petição inicial recebida e citação determinada.',                 41),
  (5, 'Distribuição',           'Processo distribuído à ' || p.court || '.',                       70)
) as t(idx, title, description, days_ago);

-- Análises: uma por processo. A situação vem dos documentos dele.
insert into public.analyses (id, office_id, process_id, status, updated_at)
select md5('lexia:analysis:proc-' || p.n)::uuid, 'e9184ec0-1771-b6a1-0bb0-506f9c19dab3', md5('lexia:proc-' || p.n)::uuid,
       case when bool_and(d.status = 'Analisado') then 'Concluída'
            when bool_or(d.status = 'Em processamento') then 'Em processamento'
            else 'Pendente' end,
       p.updated_at
from seed_processes p
join public.documents d on d.process_id = md5('lexia:proc-' || p.n)::uuid
group by p.n, p.updated_at;

-- Itens da análise: 9 por processo, cada um apontando para documento e página de origem.
insert into public.analysis_items (id, office_id, analysis_id, section, position, label, value, source_document_id, source_page)
select md5('lexia:item:proc-' || p.n || ':' || t.pos)::uuid, 'e9184ec0-1771-b6a1-0bb0-506f9c19dab3', md5('lexia:analysis:proc-' || p.n)::uuid,
       t.section, t.pos, t.label, t.value, d.id, t.page
from seed_processes p
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
join public.documents d on d.process_id = md5('lexia:proc-' || p.n)::uuid and d.name = t.doc_name;

-- Consultas: 2 por processo, feitas pelo responsável.
insert into public.consultations (id, office_id, process_id, profile_id, question, answer, source_document_id, source_page, created_at)
select md5('lexia:consult:proc-' || p.n || ':' || t.idx)::uuid, 'e9184ec0-1771-b6a1-0bb0-506f9c19dab3', md5('lexia:proc-' || p.n)::uuid, r.id,
       t.question, t.answer, d.id, t.page, p.updated_at + (t.idx - 1) * interval '1 second'
from seed_processes p
join public.profiles r on r.office_id = 'e9184ec0-1771-b6a1-0bb0-506f9c19dab3' and r.name = p.responsible
cross join lateral (values
  (1, 'Qual é o valor da causa?',
      'O valor da causa informado na petição inicial é de ' || pg_temp.brl(p.case_value) || '.', 'Petição Inicial', 4),
  (2, 'Qual foi o último despacho?',
      'O último despacho determinou a intimação da parte autora para manifestação no prazo de 15 dias.', 'Despacho', 1)
) as t(idx, question, answer, doc_name, page)
join public.documents d on d.process_id = md5('lexia:proc-' || p.n)::uuid and d.name = t.doc_name;

-- Conferência: deve mostrar 128 processos, 768 documentos, 640 movimentações,
-- 128 análises, 1152 itens de análise, 256 consultas, 3 prazos e 5 pessoas.
select
  (select count(*) from public.processes)       as processos,
  (select count(*) from public.documents)       as documentos,
  (select count(*) from public.process_events) as movimentacoes,
  (select count(*) from public.analyses)        as analises,
  (select count(*) from public.analysis_items)  as itens_analise,
  (select count(*) from public.consultations)   as consultas,
  (select count(*) from public.deadlines)       as prazos,
  (select count(*) from public.profiles)        as equipe;
