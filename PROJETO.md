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
| 6 | Multi-tenancy (validação do isolamento com RLS) | **Próxima** |
| 7 | Cadastro de processos | Pendente |
| 8 | Upload de documentos | Pendente |
| 9 | Gemini | Pendente |
| 10 | Análise de documentos | Pendente |
| 11 | Perguntas sobre processos | Pendente |
| 12 | Referências/páginas | Pendente |
| 13 | Testes | Pendente |
| 14 | Primeiro piloto com escritório | Pendente |

> A landing page pública (que existiu brevemente) foi **adiada de propósito**. Caio quer construir o sistema primeiro e depois fazer uma landing mais desenvolvida e interativa.

---

## 7. Estado atual

**Atualizado em: 08/10/2026 (Fase 5B concluída)**

- **Fase 5A (login) concluída.** Login por e-mail e senha, rotas protegidas por `proxy.ts`, botão Sair. Variáveis na Vercel: `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (só na Vercel, nunca no GitHub; sem elas o site responde 500 de propósito). O login de Caio está vinculado ao perfil `Caio Henrique` (Administrador, escritório Silva & Associados).
- **Fase 5B concluída (08/10/2026).** Todas as telas do painel leem do Supabase, com o RLS filtrando pelo usuário logado: Processos, Processo individual, Documentos, Análises, Equipe, Configurações (nome do escritório), menu lateral e barra superior (usuário, função, escritório e data de hoje) e dashboard (processos recentes, 4 indicadores e próximos prazos). Todas as consultas ficam em `lib/data/queries.ts`. A parte 1 (Processos, Documentos, Análises, recentes) foi testada em produção; a parte 2 (usuário/escritório reais, Equipe, indicadores e prazos) foi entregue e aguarda teste.
- **Ainda ilustrativo:** o gráfico "Atividade do escritório" do dashboard (barras de exemplo, está rotulado como ilustrativo); em Configurações, e-mail, telefone e cidade do escritório são exemplos (a tabela `offices` só tem nome e logo); o botão Convidar usuário, Salvar alterações, Enviar logo e o envio de documentos ainda não fazem nada.
- Se o login existir mas não estiver vinculado a um perfil (`auth_user_id` vazio em `profiles`), o painel mostra a tela "Conta ainda sem escritório" em vez de telas vazias.
- Os indicadores do dashboard são: processos ativos (status diferente de Concluído), processos analisados (análises Concluída), documentos (e enviados nos últimos 30 dias) e prazos a vencer (com os da semana). Prazos já vencidos não aparecem.
- Arquivos que **não são mais usados por nenhuma tela** e podem ser apagados: `lib/mock-data.ts`, `lib/mock-team.ts`, `lib/mock-process-details.ts` (apague os três juntos, pois um importa o outro), além de `components/landing/`.
- Pendência de organização: a pasta do SQL no GitHub se chama `superbase` (com "r"); o correto é `supabase`.

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

### Plano da Fase 5 (em duas partes)

- **5A, login:** instalar `@supabase/supabase-js` e `@supabase/ssr`; variáveis de ambiente `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` (local e Vercel); página `/login`; proteção das rotas do painel (quem não está logado vai para `/login`); botão Sair; vincular o login de Caio ao perfil `Caio Henrique`.
- **5B, dados reais (concluída):** as telas passaram a consultar o Supabase com o usuário logado, e o RLS filtra sozinho. Os `lib/mock-*.ts` ficaram sem uso.

### Próximos passos

1. Testar em produção a parte 2 da 5B: menu e barra superior com o seu nome e escritório, data de hoje, Equipe com as 5 pessoas, Configurações com o nome do escritório e dashboard com indicadores e prazos reais.
2. Limpeza: apagar `lib/mock-data.ts`, `lib/mock-team.ts`, `lib/mock-process-details.ts` e `components/landing/`; renomear `superbase` para `supabase`.
3. **Fase 6 (multi-tenancy):** criar um segundo escritório fictício com outro usuário e comprovar, pelo site, que um não vê os dados do outro.
4. **Fase 7:** cadastro de processos (primeira escrita no banco; as políticas de insert já existem).

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
    dashboard/ processos/ processos/[id]/ documentos/ analises/ equipe/ configuracoes/
components/                componentes por área (dashboard, process, processes, team, layout, login, ui...)
lib/
  supabase/client.ts       cliente do Supabase para o navegador (chave pública)
  supabase/server.ts       cliente do Supabase para o servidor (envia o login; o RLS filtra)
  supabase/proxy.ts        renova a sessão e decide quem entra (usado pelo proxy.ts)
  data/queries.ts          TODAS as consultas ao banco (sessão, processos, documentos, análises, equipe, dashboard)
  permissions.ts           tabela de permissões exibida na tela Equipe (espelha o RLS)
  types.ts                 tipos do domínio (já com officeId; espelham as futuras tabelas)
  mock-data.ts, mock-process-details.ts, mock-team.ts   SEM USO (dados fictícios antigos; podem ser apagados)
  navigation.ts            itens do menu
supabase/                  (rodados à mão no SQL Editor do Supabase, nesta ordem)
  01_schema.sql            tabelas + segurança (RLS)
  02_dados_ficticios.sql   dados fictícios do escritório Silva & Associados
  03_teste_isolamento.sql  testes de isolamento entre escritórios
```

Os arquivos `lib/mock-*.ts` não são mais usados (ver "Estado atual") e podem ser apagados. Nunca colocar processos reais neles.

---

## 9. Princípio que guia as decisões

> "Como construir isso de forma simples agora, mas sem impedir que vire um produto profissional depois?"

Evitar tanto código amador difícil de evoluir quanto arquitetura empresarial exagerada para um MVP.
