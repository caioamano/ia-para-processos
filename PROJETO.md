# LexIA — contexto do projeto

> **Para quem for ajudar (Claude, ChatGPT ou pessoa):** leia este arquivo inteiro antes de mexer em qualquer coisa. Ele é a fonte de verdade sobre o projeto. Atualize a seção "Estado atual" ao final de cada fase.

- Repositório: https://github.com/caioamano/ia-para-processos
- Site (Vercel): https://ia-para-processos.vercel.app
- Nome: **LexIA** (provisório, pode mudar)

> **Nunca** coloque neste arquivo senhas, chaves do Supabase (`service_role`), chaves da API do Gemini ou qualquer segredo. O repositório é público.

---

## 1. Sobre o dono do projeto

Caio estuda Direito e ADS (programação). Aprende principalmente Python e quer aprender desenvolvimento web moderno construindo este produto. **Não é um desenvolvedor experiente.**

Como ajudar:

1. Explique **o que** estamos fazendo e **por que**.
2. Mostre o código necessário e diga **exatamente em qual arquivo** colocar.
3. Explique **como testar** e os **erros comuns**.
4. Prefira sempre a solução mais simples adequada ao estágio atual e explique como evoluí-la depois.
5. Não complique: nada de microserviços, Docker, Kubernetes, Redis ou arquiteturas complexas sem necessidade real.
6. Não pule fases sem necessidade.

O fluxo de trabalho de Caio é: receber os arquivos, subir pelo GitHub ("Add files via upload"), e a Vercel publica sozinha. Entregue arquivos prontos e diga o que substituir/apagar. Quando uma troca depender de ordem (ex.: trocar um arquivo antes de apagar outro), avise.

### Regra de continuidade (obrigatória)

Toda vez que o trabalho avançar, quem estiver ajudando deve, **antes de encerrar a resposta**:

1. **Entregar o `PROJETO.md` atualizado** (seções 6 e 7: quadro de fases, "Estado atual", decisões tomadas e próximos passos) junto com os demais arquivos.
2. Dizer a Caio, em lista curta e numerada, **o que ele precisa fazer para continuar** (arquivos a subir, o que apagar, o que configurar no Supabase/Vercel e o que responder no próximo chat).
3. Lembrar que o `PROJETO.md` novo substitui o antigo na raiz do repositório.

Se o arquivo não for atualizado, a próxima conversa começa com informação velha.

---

## 2. O produto

Plataforma SaaS para **escritórios de advocacia**: organizar, analisar e consultar processos jurídicos de forma mais rápida.

- **Não** é um "advogado de IA" e **não** substitui o advogado. A IA é uma funcionalidade interna.
- O produto vende **tempo economizado**, não "inteligência artificial".
- Problema: advogados e estagiários perdem muito tempo localizando informações (despachos, pedidos, valores, partes, movimentações) em processos com dezenas ou centenas de páginas.
- Funcionalidade central: enviar PDFs de um processo, analisar, gerar informações estruturadas e permitir **consultas com fonte e página**.

Exemplo de resposta esperada:

> "O valor da causa informado na petição inicial é de R$ 85.000,00.
> Fonte: Petição Inicial — página 4."

O sistema nunca deve fazer afirmação jurídica sem apresentar a fonte. A decisão jurídica é sempre do profissional.

### Multi-tenant

Uma única aplicação atende vários escritórios. **Os dados de um escritório nunca podem aparecer para outro.** Toda tabela (exceto `offices`) tem `office_id`, e o isolamento será garantido pelo banco com **Row Level Security (RLS)** no Supabase.

### Evolução do produto (não construir tudo de uma vez)

| Versão | Conteúdo |
|---|---|
| V1 | Interface, cadastro de processo, upload de PDF, análise, resumo estruturado |
| V2 | Perguntas sobre o processo, respostas baseadas nos documentos, histórico de consultas |
| V3 | Respostas com página/fonte, conferência no documento |
| V4 | Comparação (petição inicial × contestação) |
| V5 | Vários processos, pesquisa entre processos, filtros, indicadores, equipe, permissões, personalização do escritório |

---

## 3. Stack

| Camada | Tecnologia |
|---|---|
| Aplicação | Next.js (App Router), React, TypeScript, Tailwind CSS |
| Hospedagem | Vercel |
| Banco | Supabase (PostgreSQL) |
| Autenticação | Supabase Auth |
| Arquivos | Supabase Storage (inicialmente) |
| IA | Google Gemini API (free tier no desenvolvimento; pode trocar depois) |
| Código | GitHub |

Gerenciador de pacotes: **pnpm**.

---

## 4. Identidade visual

O produto deve parecer **primeiro um software jurídico profissional**. A IA é só um recurso interno.

**Não quero:** aparência de chatbot, "AI startup", robô, cérebro digital, neon, gradiente roxo, efeitos futuristas, "✨ AI Magic".

**Linguagem da interface:** prefira "Consultar processo" a "Pergunte à IA", e "Consulta" a "AI Assistant".

Paleta:

| Cor | Hex |
|---|---|
| Verde escuro | `#003020` |
| Verde oliva | `#829B66` |
| Cinza oliva | `#727668` |
| Cinza claro | `#D6D6D6` |

Mais branco e tons claros. Estilo: sóbrio, limpo, premium, empresarial. Poucas animações. Muito foco em tabelas, documentos e informações. Boa tipografia.

---

## 5. Segurança e dados

- Durante o desenvolvimento, **nunca usar processos reais ou confidenciais**. Apenas dados fictícios, públicos ou anonimizados.
- Considerar ao longo do projeto: autenticação, autorização, isolamento entre escritórios, RLS, armazenamento seguro, logs, backups, LGPD, sigilo profissional, retenção de dados.
- Nunca usar a chave `service_role` do Supabase no navegador. Ela ignora o RLS.

---

## 6. Roteiro de fases

| Fase | Descrição | Situação |
|---|---|---|
| 1 | Interface e design | Concluída |
| 2 | GitHub | Concluída |
| 3 | Vercel | Concluída |
| 4 | Supabase (projeto, tabelas com `office_id`, RLS, dados fictícios) | Concluída |
| 5 | Autenticação (e telas passam a ler do banco) | **Concluída** (5A login; 5B todas as telas do painel leem do Supabase; só o gráfico de atividade do dashboard segue ilustrativo) |
| 6 | Multi-tenancy (validação do isolamento com RLS) | **Concluída** (2º escritório; conferência SQL 35/35 ✅ e teste pelo site com os dois logins, em 09/10/2026) |
| 7 | Cadastro de processos | **Concluída** (testada no site por Caio em 10/10/2026) |
| 8 | Upload de documentos | **Concluída** (envio de PDF testado no site por Caio em 10/10/2026) |
| 9 | Gemini: cadastrar o processo a partir do PDF | **Concluída** (9A, 9B e 9C testadas no site em 10/10/2026) |
| 10 | Análise de documentos | **Em andamento** (10A, o motor, entregue em 10/10/2026, aguardando teste; falta a 10B, botão e gravação) |
| 11 | Perguntas sobre processos | Pendente |
| 12 | Referências/páginas | Pendente |
| 13 | Testes | Pendente |
| 14 | Primeiro piloto com escritório | Pendente |

> A landing page pública (que existiu brevemente) foi **adiada de propósito**. Caio quer construir o sistema primeiro e depois fazer uma landing mais desenvolvida e interativa.

---

## 7. Estado atual

**Atualizado em: 10/10/2026 (Fases 1 a 9 concluídas; Fase 10A entregue, aguardando teste)**

- **Fase 5A (login) concluída.** Login por e-mail e senha, rotas protegidas por `proxy.ts`, botão Sair. Variáveis na Vercel: `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (só na Vercel, nunca no GitHub; sem elas o site responde 500 de propósito). O login de Caio está vinculado ao perfil `Caio Henrique` (Administrador, escritório Silva & Associados).
- **Fase 5B concluída (08/10/2026).** Todas as telas do painel leem do Supabase, com o RLS filtrando pelo usuário logado: Processos, Processo individual, Documentos, Análises, Equipe, Configurações (nome do escritório), menu lateral e barra superior (usuário, função, escritório e data de hoje) e dashboard (processos recentes, 4 indicadores e próximos prazos). Todas as consultas ficam em `lib/data/queries.ts`. Testada e funcionando em produção (09/10/2026).
- **Ainda ilustrativo:** o gráfico "Atividade do escritório" do dashboard (barras de exemplo, está rotulado como ilustrativo); em Configurações, e-mail, telefone e cidade do escritório são exemplos (a tabela `offices` só tem nome e logo); o botão Convidar usuário, Salvar alterações, Enviar logo e o envio de documentos ainda não fazem nada.
- Se o login existir mas não estiver vinculado a um perfil (`auth_user_id` vazio em `profiles`), o painel mostra a tela "Conta ainda sem escritório" em vez de telas vazias.
- Os indicadores do dashboard são: processos ativos (status diferente de Concluído), processos analisados (análises Concluída), documentos (e enviados nos últimos 30 dias) e prazos a vencer (com os da semana). Prazos já vencidos não aparecem.
- Arquivos que **não são mais usados por nenhuma tela** e podem ser apagados: `lib/mock-data.ts`, `lib/mock-team.ts`, `lib/mock-process-details.ts` (apague os três juntos, pois um importa o outro), além de `components/landing/`.

- **Fase 6 (09/10/2026):** o escritório fictício Ribeiro & Lima Advocacia existe (8 processos, 3 pessoas) e o login da administradora `Marcela Ribeiro` foi criado e vinculado. A conferência `05_conferir_isolamento.sql` com os dois logins reais passou em **35 de 35 testes** (cada um vê todos os dados do próprio escritório e nenhum do outro; tentativas de alteração entre escritórios afetam 0 linhas; visitante sem login é bloqueado). O teste pelo site com os dois logins também passou: cada um só vê o próprio escritório e abrir por link direto o processo do outro dá "não encontrado". **Fase 6 concluída.** A pasta do SQL já foi renomeada para `supabase`.
- **Fase 7 (concluída; testada no site em 10/10/2026):** botão **Novo processo** (só para Administrador e Advogado) abre `/processos/novo`, com formulário de número (formato CNJ, aceita só os 20 dígitos), cliente, tipo, situação, responsável, parte contrária, juízo, valor da causa e data de distribuição. A gravação roda no servidor (`app/(app)/processos/novo/actions.ts`): confere login, função e campos; o escritório vem da sessão, nunca do formulário; o RLS e a chave composta do banco são a segunda barreira. Número repetido no escritório, responsável de outro escritório e falta de permissão viram mensagens amigáveis. Ao cadastrar, abre o processo novo, cujas abas vazias mostram "ainda não há...". As regras do formulário estão em `lib/process-form.ts`. O teste de segurança da escrita é `supabase/06_testar_cadastro.sql` (13 testes; apaga o que cria).
- **Ainda não valida o dígito verificador do CNJ** (só o formato); os números fictícios do desenvolvimento não passariam. Avaliar antes do piloto.

- **Fase 8 (concluída; envio de PDF e cadastro testados no site em 10/10/2026):** botão **Enviar documento** na tela do processo (qualquer função envia; vários PDFs de uma vez, até 50 MB cada). O navegador envia o PDF **direto para o Supabase Storage** (a Vercel limita o corpo de um pedido a ~4,5 MB, pouco para um processo) na pasta `<escritório>/<processo>/<documento>.pdf`; em seguida o servidor (`app/(app)/processos/[id]/documentos-actions.ts`) baixa o arquivo, confere que é PDF de verdade (cabeçalho `%PDF-`), conta as páginas (`pdf-lib`) e só então grava a linha em `documents` (status Pendente, `storage_path` preenchido, `uploaded_by`). PDF inválido é rejeitado e o arquivo apagado. **Abrir PDF** passa por `/documentos/[id]/arquivo`, que confere o login e o escritório e redireciona para um link temporário de 60 segundos. **Excluir** só para Administrador e Advogado (apaga a linha e o arquivo; análises e consultas que citavam o documento ficam sem a fonte). Documentos fictícios do início aparecem como "Sem arquivo". Regras do Storage em `supabase/07_armazenamento_documentos.sql`; teste de segurança em `supabase/08_testar_armazenamento.sql` (17 testes; só linhas de teste, apagadas no fim). PDFs fictícios de exemplo para testes: petição inicial e procuração (Marina Teixeira Souza x Construtora Horizonte, Londrina; fora do repositório, em `exemplos/`).
- **Limites conhecidos da Fase 8:** o plano gratuito do Supabase limita o arquivo a 50 MB; sem barra de progresso do envio; um arquivo enviado por estagiário que o servidor rejeita pode ficar órfão no Storage (a regra de exclusão é só para Administrador/Advogado); documentos protegidos por senha ainda não são tratados (importa na Fase 9).

- **Fase 9A (concluída; `/api/gemini-teste` respondeu `ok:true` com `gemini-3.5-flash` em 10/10/2026):** `lib/gemini.ts` (conexão com o Gemini; só roda no servidor, usa o pacote `server-only`; lê `GEMINI_API_KEY` e, opcionalmente, `GEMINI_MODEL`; modelo padrão `gemini-3.5-flash`, trocável pela variável sem mexer no código) e a rota temporária `app/api/gemini-teste/route.ts` (só Administrador logado; pergunta fixa, não envia dado do escritório). Pacotes novos: `@google/genai` e `server-only`. Revisão do código em 10/10/2026: `tsc` e `pnpm build` passam; telas e ações das Fases 7 e 8 batem com o descrito acima. Correção de deploy: o pnpm novo falha na Vercel (`ERR_PNPM_IGNORED_BUILDS`) se pacotes com script de instalação não forem listados; por isso o `pnpm-workspace.yaml` tem `allowBuilds` com `@google/genai` e `protobufjs` em `false`. Ao adicionar pacote novo, se o deploy falhar em ~12 s na instalação, é isto.
- **Fase 9B (concluída; testada no site em 10/10/2026 com a petição fictícia: todos os campos vieram certos, 17 s, ~2.200 tokens de entrada):** leitura do PDF pelo Gemini, **sem tela e sem gravar nada no banco**. Arquivos: `lib/cnj.ts` (formato e dígito verificador do número CNJ, módulo 97), `lib/process-extraction.ts` (instruções ao Gemini, formato JSON da resposta e `normalizeExtraction`, que confere tudo e gera avisos), `lib/pdf-slice.ts` (em PDF grande manda só as primeiras 40 páginas, depois 15, depois 5, se o arquivo passar de 15 MB; a numeração das páginas não muda), `lib/gemini-extract.ts` (chama o Gemini com o PDF em linha, `temperature 0`, resposta em JSON, limite de 50 s) e a rota temporária `app/api/extracao-teste/route.ts` (só Administrador; lê o PDF mais recente do escritório ou `?documento=<id>`; **envia o PDF ao Gemini**, usar só documento fictício). Campos extraídos, cada um com página e trecho do documento: número do processo, vara/tribunal, nome da ação, tipo (sugestão entre Cível/Trabalhista/Empresarial/Tributário), valor da causa, data de distribuição, polo ativo e polo passivo. O Gemini devolve o texto como está escrito e o **código** converte (data, valor, número), nunca o Gemini. Descartado com aviso: número fora do formato CNJ, valor ou data ilegíveis, data futura, página inexistente no trecho lido. Só avisa, sem descartar: dígito verificador do CNJ errado; ano do número diferente do ano da distribuição. Quem é o cliente do escritório **não** sai do documento: o advogado escolhe o polo na 9C. **Primeiro teste (10/10/2026):** o Gemini devolveu 503 "high demand" (sobrecarga temporária do modelo, não bug nosso). Por isso a leitura tenta até 3 vezes (pausas de 2 s e 4 s, limite total de 52 s) e, se existir a variável opcional `GEMINI_FALLBACK_MODEL` na Vercel, a 3ª tentativa usa esse modelo reserva; a rota de teste mostra o campo `detalhe` com o motivo técnico. Usa `generateContent` (o mesmo caminho do teste da 9A); a documentação do Google já mostra a nova Interactions API e o modelo `gemini-3.8-flash`; trocar de modelo é só mudar `GEMINI_MODEL` na Vercel. O PDF fictício da petição (Marina x Construtora Horizonte) tem número CNJ inventado cujo dígito verificador **não confere**: o aviso é esperado nesse teste.

- **Fase 9C (entregue em 10/10/2026, aguardando teste no site):** na tela **Novo processo** aparece o painel "Preencher a partir de um PDF" (o formulário manual continua igual). Fluxo: o navegador confere o arquivo (PDF, até 50 MB) e envia direto ao Storage em `<escritório>/rascunhos/<id>.pdf` (o processo ainda não existe; a regra do Storage olha só a 1ª pasta, então não precisou de SQL novo) → a ação `readDraftPdf` (`app/(app)/processos/novo/pdf-actions.ts`, só Administrador/Advogado, caminho montado com o escritório da **sessão**) baixa o rascunho, confere que é PDF e chama `extractProcessFromPdf` → `lib/process-prefill.ts` (`buildPrefill`) transforma o resultado em valores do formulário → o formulário nasce preenchido (`components/processes/new-process-flow.tsx` recria o formulário com `key`) com a etiqueta "Lido do PDF, p. N: «trecho»" embaixo de cada campo, os avisos no topo e o seletor "Quem é o seu cliente neste processo? (Autor/Réu)", que preenche Cliente e Parte contrária (o documento não diz quem é o cliente). Nomes todos em maiúsculas viram "Marina Teixeira Souza" / "Construtora Horizonte LTDA" (`prettyName`). Ao cadastrar, `createProcess` cria o processo e, se veio `draftId`, **copia** o rascunho para o caminho definitivo (`storage.copy`; não há regra de UPDATE no Storage, então não dá para `move`), registra o documento pelo `registerDocument` de sempre e apaga o rascunho. Se a anexação falhar, o processo fica criado e a página dele mostra o aviso `?pdf=erro` (enviar o PDF de novo pelo botão normal). Trocar de PDF ou falha na leitura apagam o rascunho anterior (melhor esforço). **Sobras possíveis:** se a pessoa fecha a aba antes de cadastrar, o rascunho fica no Storage sem uso; limpeza futura (apagar `rascunhos/` com mais de alguns dias). A tela avisa que o PDF é enviado ao Gemini. A ação roda com `maxDuration = 60` na página `/processos/novo`.

- **Fase 10A (entregue em 10/10/2026, aguardando teste no site):** motor da análise de documentos, **sem gravar nada e sem botão** (isso é a 10B). O banco já tinha tudo (`analyses`, `analysis_items` com `section`, `label`, `value`, `source_document_id`, `source_page`; a tela de Análise já mostra os itens com "Fonte: documento — página N"; só Administrador/Advogado escrevem). Arquivos novos: `lib/document-analysis.ts` (seções Partes/Valores/Pedidos/Argumentos/Decisões/Prazos, instruções ao Gemini, formato JSON, `normalizeAnalysis`, `planAnalysisChunks`, `mergeAnalysisItems`), `lib/gemini-call.ts` (chamada genérica PDF → JSON com as mesmas tentativas e modelo reserva da 9B), `lib/gemini-analyze.ts` (`analyzePdfChunk`), `slicePdfPages` em `lib/pdf-slice.ts` e a rota temporária `app/api/analise-teste/route.ts` (só Administrador; `?documento=<id>&parte=<n>`; **envia o trecho ao Gemini**; apagar na 10B). Regras: o documento é lido em **partes de 20 páginas** (limite atual: **200 páginas**; a 10B chama uma parte por vez, com progresso, porque cada chamada precisa caber nos 60 s da Vercel); a página que o Gemini informa é relativa à parte e o código soma o começo dela; **item sem página válida é descartado** (regra de ouro: sempre fonte); seção desconhecida, item vazio e duplicado também; limites: título 80, conteúdo 400, trecho literal 200 caracteres, 40 itens por parte; o prompt proíbe opinião, avaliação de chances e conselho jurídico. Cada item guarda também um **trecho literal** (`quote`) do documento. Ainda **não** há coluna para ele no banco: a 10B adiciona `source_quote` (SQL `09`) para mostrar ao advogado e para a verificação de páginas da Fase 12. Fora do escopo da 10 (ideias): eventos da linha do tempo (`process_events`) e prazos (`deadlines`) gerados a partir do documento.

### Decisões tomadas

- **RLS ligado desde o início**, com políticas já escritas. As telas só passam a ler do banco na Fase 5 (com login), porque o RLS depende de saber quem está logado (`auth.uid()`).
- **Nunca usar `service_role` como atalho** para ligar o site ao banco. Nunca colocar essa chave no código, no GitHub ou em chats.
- **`profiles` separado de `auth.users`:** `profiles` guarda escritório e função. `auth_user_id` fica vazio até a pessoa criar conta ("Convite pendente"). Ao criar conta, vincula-se `auth_user_id` ao perfil.
- **Chaves compostas `(id, office_id)`:** toda ligação entre tabelas também confere o escritório.
- **Funções auxiliares no schema `private`** (`current_office_id`, `current_profile_id`, `current_role_name`), com `security definer`.
- **Status, tipos e funções como texto** com `check` (os mesmos textos das telas). Pode virar enum depois.
- **Permissões (RLS):** todos veem o escritório; todos enviam documentos e registram consultas (só em nome próprio); Administrador e Advogado cadastram/editam processos e análises; só o Administrador gerencia equipe e configurações.
- `anon` (visitante sem login) não acessa nenhuma tabela. Tabelas novas precisam repetir os `grant` do fim da seção de segurança do `01_schema.sql`.

- **Next.js 16 usa `proxy.ts`** (na raiz) no lugar do antigo `middleware.ts`. Ele usa `getClaims()` (confere a assinatura do login) e nunca `getSession()` para decidir acesso.
- **Login por e-mail e senha** (`signInWithPassword`), sem cadastro público: contas são criadas pelo painel do Supabase/convite.
- A chave `sb_publishable_...` é pública por desenho (vai no navegador); a proteção dos dados é do RLS. `sb_secret_`/`service_role` jamais.

- **Nenhuma consulta filtra por escritório no código.** Quem garante o isolamento é o RLS. As páginas usam `lib/supabase/server.ts` (que envia o login do usuário ao banco). Nunca trocar por uma chave que ignore o RLS.
- **Link antigo de processo (`/processos/proc-1`) agora dá "não encontrado"**: os processos reais têm id UUID.
- **Fonte só aparece se for real:** uma informação sem documento/página no banco é mostrada sem o selo "Fonte". O Resumo não inventa mais fonte.
- Erros de carregamento caem em `app/(app)/error.tsx` (mensagem amigável + "Tentar novamente"); o detalhe fica nos logs da Vercel.
- Listas (Processos, Documentos) ainda carregam tudo e filtram/paginam no navegador; o Supabase devolve no máximo 1.000 linhas por consulta. Quando passar disso, migrar para busca e paginação no banco.

- **Princípio de produto (pedido do Caio):** a IA faz o máximo possível; o advogado sobe o PDF e preenche só o que a IA não consegue obter dos documentos. A IA **sugere**, o advogado **confirma**, e todo dado vindo da IA mostra **documento e página de origem**.
- **Plano da Fase 9 — "cadastrar a partir do PDF":** o advogado envia o PDF; o Gemini devolve cada campo com página de origem; aparece o formulário de Novo processo **já preenchido** (cada campo da IA com etiqueta "Lido de X, p. N"; o que não foi achado fica em branco como "Preencher"); o advogado confere, completa e confirma. O formulário manual continua (processo sem PDF, plano B).
  - A IA consegue (alta confiança): número do processo (o dígito verificador do CNJ e o ramo da Justiça saem por regra fixa, sem IA), partes autora e ré, juízo/vara, valor da causa; (média): data de distribuição (só se houver capa ou carimbo), tipo (sugestão; Empresarial e Tributário são categorias do sistema), prazos (sugestão: contar prazo tem risco jurídico).
  - A IA **não** consegue: responsável (decisão interna), situação (etapa do fluxo do escritório), **quem é o cliente** (depende de qual parte contratou o escritório; a procuração ajuda; sem ela a IA mostra as duas partes e o advogado escolhe), qualquer coisa que não esteja nos documentos, e PDF escaneado ruim (o sistema deve avisar, não chutar).
  - Pergunta em aberto: o advogado costuma ter só a petição inicial ou o processo completo (autos)?
  - **Dados reais:** o plano gratuito da API do Gemini pode usar o conteúdo enviado para treinar modelos. Antes do piloto (Fase 14) é preciso plano pago com garantia de não uso para treinamento. Até lá, só documentos fictícios.

### Plano da Fase 5 (em duas partes)

- **5A, login:** instalar `@supabase/supabase-js` e `@supabase/ssr`; variáveis de ambiente `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (Vercel); página `/login`; proteção das rotas do painel (quem não está logado vai para `/login`); botão Sair; vincular o login de Caio ao perfil `Caio Henrique`.
- **5B, dados reais (concluída):** as telas passaram a consultar o Supabase com o usuário logado, e o RLS filtra sozinho. Os `lib/mock-*.ts` ficaram sem uso.

### Próximos passos

0. **Fase 10A (teste):** subir os arquivos, esperar o deploy Ready e abrir `/api/analise-teste` logado como Administrador (analisa a 1ª parte do PDF mais recente). Conferir se os itens da petição fictícia batem com o documento e se cada página está certa.
1. **(feito) Fase 9C (teste):** subir os arquivos, esperar o deploy Ready; em Novo processo, escolher o PDF fictício, conferir os campos e as etiquetas de página, escolher Autor ou Réu como cliente, escolher o responsável, cadastrar; na página do processo conferir que o PDF apareceu em Documentos (e que o rascunho sumiu do Storage). Testar também: cadastro manual sem PDF, número repetido (erro no campo), PDF que não é processo, e a Marcela (outro escritório) não ver nada.
2. Apagar as rotas temporárias `app/api/gemini-teste` e `app/api/extracao-teste` (já podem sair; a 9C está concluída) e, depois da 10B, `app/api/analise-teste`.
3. Limpeza (pode fazer a qualquer momento, não bloqueia nada): apagar `lib/mock-data.ts`, `lib/mock-team.ts`, `lib/mock-process-details.ts` e `components/landing/` (os três `mock` juntos).

---

## 8. Estrutura do código

```
proxy.ts                   protege as rotas: sem login vai para /login (Next 16)
app/
  page.tsx                 raiz: redireciona para /dashboard
  login/page.tsx           tela de login (fora do grupo (app): sem menu)
  layout.tsx
  globals.css              cores e tipografia (paleta acima)
  (app)/                   grupo de rotas com menu lateral + barra superior
    layout.tsx
    dashboard/ processos/ processos/novo/ processos/[id]/ documentos/ analises/ equipe/ configuracoes/
  api/gemini-teste/route.ts  rota TEMPORÁRIA de teste da chave do Gemini (só Administrador); apagar depois da Fase 9
  api/analise-teste/route.ts  rota TEMPORÁRIA de teste da análise (só Administrador; envia o trecho ao Gemini); apagar na 10B
  api/extracao-teste/route.ts  rota TEMPORÁRIA de teste da leitura do PDF (só Administrador; envia o PDF ao Gemini); apagar quando a 9C estiver pronta
components/                componentes por área (dashboard, process, processes, team, layout, login, ui...)
lib/
  supabase/client.ts       cliente do Supabase para o navegador (chave pública)
  supabase/server.ts       cliente do Supabase para o servidor (envia o login; o RLS filtra)
  supabase/proxy.ts        renova a sessão e decide quem entra (usado pelo proxy.ts)
  gemini.ts                conexão com o Gemini (só servidor; chave em GEMINI_API_KEY na Vercel)
  document-analysis.ts     regras da análise: seções, instruções ao Gemini, conferência dos itens, divisão em partes de 20 páginas
  gemini-call.ts           chamada genérica PDF -> JSON no Gemini, com tentativas e modelo reserva (só servidor)
  gemini-analyze.ts        analisa uma parte do PDF e devolve itens conferidos (só servidor)
  process-prefill.ts       transforma a leitura do PDF em valores do formulário (nomes, valor, polos, caminho do rascunho)
  gemini-extract.ts        manda o PDF ao Gemini e devolve os campos já conferidos (só servidor)
  process-extraction.ts    instruções, formato da resposta e conferência dos campos (sem Gemini, sem banco)
  pdf-slice.ts             corta PDF grande nas primeiras páginas antes de enviar
  cnj.ts                   formato e dígito verificador do número do processo
  data/queries.ts          TODAS as consultas ao banco (sessão, processos, documentos, análises, equipe, dashboard)
  permissions.ts           tabela de permissões exibida na tela Equipe (espelha o RLS)
  process-form.ts          regras do formulário Novo processo (validação; sem React nem banco)
  documents.ts             regras de arquivos (limite 50 MB, caminho no Storage, conferência de PDF, nomes)
  types.ts                 tipos do domínio (já com officeId; espelham as futuras tabelas)
  mock-data.ts, mock-process-details.ts, mock-team.ts   SEM USO (dados fictícios antigos; podem ser apagados)
  navigation.ts            itens do menu
supabase/                  (rodados à mão no SQL Editor do Supabase, nesta ordem)
  01_schema.sql            tabelas + segurança (RLS)
  02_dados_ficticios.sql   dados fictícios do escritório Silva & Associados (NÃO rodar de novo: desfaz o vínculo do login)
  03_teste_isolamento.sql  testes de isolamento da Fase 4 (NÃO rodar de novo: desfaz o vínculo do login)
  04_segundo_escritorio.sql  escritório fictício Ribeiro & Lima Advocacia (Fase 6)
  05_conferir_isolamento.sql conferência read-only com os dois logins reais; pode rodar sempre que quiser
  06_testar_cadastro.sql   teste de segurança do cadastro de processos (Fase 7); apaga o que cria; pode rodar quando quiser
  07_armazenamento_documentos.sql  bucket privado `documents` e regras (RLS) do Storage por escritório (Fase 8); pode rodar de novo
  08_testar_armazenamento.sql      teste de segurança dos arquivos (Fase 8); apaga o que cria; pode rodar quando quiser
```

Os arquivos `lib/mock-*.ts` não são mais usados (ver "Estado atual") e podem ser apagados. Nunca colocar processos reais neles.

---

## 9. Princípio que guia as decisões

> "Como construir isso de forma simples agora, mas sem impedir que vire um produto profissional depois?"

Evitar tanto código amador difícil de evoluir quanto arquitetura empresarial exagerada para um MVP.
