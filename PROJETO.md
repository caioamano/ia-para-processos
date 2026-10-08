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
| 5 | Autenticação (e telas passam a ler do banco) | **Em andamento** |
| 6 | Multi-tenancy (validação do isolamento com RLS) | Pendente |
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

**Atualizado em: 08/10/2026**

- Interface completa com **dados fictícios**. As telas ainda leem de `lib/mock-*.ts`.
- A raiz do site (`/`) redireciona para `/dashboard`. A pasta `components/landing/` ficou sem uso e pode ser apagada.
- **Fase 4 concluída e conferida no Supabase real:** projeto `lexia` (região São Paulo) com as 9 tabelas, RLS ligado, dados fictícios carregados (128 processos, 768 documentos, 640 movimentações, 128 análises, 1152 itens de análise, 256 consultas, 3 prazos, 5 pessoas) e os 24 testes de isolamento com ✅ OK. Os arquivos estão em `supabase/` (`01_schema.sql`, `02_dados_ficticios.sql`, `03_teste_isolamento.sql`).
- **Fase 5 em andamento** (ainda sem código novo): Caio precisa criar o próprio usuário no Supabase Auth e pegar a URL e a chave pública do projeto.

### Decisões tomadas

- **RLS ligado desde o início**, com políticas já escritas. As telas só passam a ler do banco na Fase 5 (com login), porque o RLS depende de saber quem está logado (`auth.uid()`).
- **Nunca usar `service_role` como atalho** para ligar o site ao banco. Nunca colocar essa chave no código, no GitHub ou em chats.
- **`profiles` separado de `auth.users`:** `profiles` guarda escritório e função. `auth_user_id` fica vazio até a pessoa criar conta ("Convite pendente"). Ao criar conta, vincula-se `auth_user_id` ao perfil.
- **Chaves compostas `(id, office_id)`:** toda ligação entre tabelas também confere o escritório.
- **Funções auxiliares no schema `private`** (`current_office_id`, `current_profile_id`, `current_role_name`), com `security definer`.
- **Status, tipos e funções como texto** com `check` (os mesmos textos das telas). Pode virar enum depois.
- **Permissões (RLS):** todos veem o escritório; todos enviam documentos e registram consultas (só em nome próprio); Administrador e Advogado cadastram/editam processos e análises; só o Administrador gerencia equipe e configurações.
- `anon` (visitante sem login) não acessa nenhuma tabela. Tabelas novas precisam repetir os `grant` do fim da seção de segurança do `01_schema.sql`.

### Plano da Fase 5 (em duas partes)

- **5A, login:** instalar `@supabase/supabase-js` e `@supabase/ssr`; variáveis de ambiente `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` (local e Vercel); página `/login`; proteção das rotas do painel (quem não está logado vai para `/login`); botão Sair; vincular o login de Caio ao perfil `Caio Henrique`.
- **5B, dados reais:** trocar `lib/mock-*.ts` por consultas ao Supabase, tela por tela (começando por Processos), usando o usuário logado para que o RLS filtre sozinho. Os mocks só são apagados depois que todas as telas migrarem.

### Próximos passos

1. Caio cria o próprio usuário no Supabase (Authentication → Users → Add user, com e-mail e senha reais e "Auto Confirm User" marcado).
2. Caio roda o SQL de vínculo que a Claude passar (liga esse login ao perfil `Caio Henrique`).
3. Caio pega a **Project URL** e a chave pública (**anon / publishable**) em Project Settings → API e informa a Claude. A `service_role`/secret **nunca**.
4. Claude entrega o código da 5A (login e proteção das rotas).

---

## 8. Estrutura do código

```
app/
  page.tsx                 raiz: redireciona para /dashboard
  layout.tsx
  globals.css              cores e tipografia (paleta acima)
  (app)/                   grupo de rotas com menu lateral + barra superior
    layout.tsx
    dashboard/ processos/ processos/[id]/ documentos/ analises/ equipe/ configuracoes/
components/                componentes por área (dashboard, process, processes, team, layout, ui...)
lib/
  types.ts                 tipos do domínio (já com officeId; espelham as futuras tabelas)
  mock-data.ts             processos, prazos, usuário e escritório fictícios
  mock-process-details.ts  documentos, histórico, análise e consulta fictícios
  mock-team.ts             equipe e permissões fictícias
  navigation.ts            itens do menu
supabase/                  (rodados à mão no SQL Editor do Supabase, nesta ordem)
  01_schema.sql            tabelas + segurança (RLS)
  02_dados_ficticios.sql   dados fictícios do escritório Silva & Associados
  03_teste_isolamento.sql  testes de isolamento entre escritórios
```

Os arquivos `lib/mock-*.ts` serão substituídos por consultas ao Supabase a partir da Fase 5. Nunca colocar processos reais neles.

---

## 9. Princípio que guia as decisões

> "Como construir isso de forma simples agora, mas sem impedir que vire um produto profissional depois?"

Evitar tanto código amador difícil de evoluir quanto arquitetura empresarial exagerada para um MVP.
