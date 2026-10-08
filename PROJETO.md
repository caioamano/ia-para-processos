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
| 4 | Supabase (projeto, tabelas com `office_id`, RLS, dados fictícios) | **Em andamento** (SQL pronto e testado; falta rodar no Supabase) |
| 5 | Autenticação (e telas passam a ler do banco) | Pendente |
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

- Interface completa com **dados fictícios** (Visão geral, Processos, Processo individual, Documentos, Análises, Equipe, Configurações). As telas ainda leem de `lib/mock-*.ts`.
- A raiz do site (`/`) redireciona para `/dashboard`. A pasta `components/landing/` ficou sem uso e pode ser apagada.
- **Projeto Supabase `lexia` criado** (região São Paulo) por Caio.
- **Fase 4: os 3 arquivos SQL estão prontos e foram testados** num PostgreSQL local que imita o Supabase. Ficam na pasta `supabase/` do repositório:
  - `01_schema.sql`: tabelas, chaves compostas, funções auxiliares e políticas RLS (24 políticas).
  - `02_dados_ficticios.sql`: escritório Silva & Associados com os mesmos dados do site (128 processos, 768 documentos, 640 movimentações, 128 análises, 1152 itens de análise, 256 consultas, 3 prazos, 5 pessoas). Pode ser rodado de novo sem duplicar.
  - `03_teste_isolamento.sql`: cria um segundo escritório de teste, tenta acessar dados cruzados com cada função (Administrador, Advogado, Estagiário, outro escritório, sem escritório, visitante) e apaga o que criou. **24 testes passaram** localmente; ao desligar o RLS de propósito, 10 falharam (o teste detecta o problema).
- **Ainda não executado no Supabase real.** Falta Caio rodar os 3 arquivos no SQL Editor e conferir os resultados.

### Decisões tomadas

- **RLS ligado desde o início**, com políticas já escritas. As telas só passam a ler do banco na Fase 5 (com login), porque o RLS depende de saber quem está logado (`auth.uid()`).
- **Nunca usar `service_role` como atalho** para ligar o site ao banco.
- **`profiles` separado de `auth.users`:** a tabela `profiles` guarda escritório e função. A coluna `auth_user_id` fica vazia até a pessoa criar conta (é o caso do "Convite pendente"). Na Fase 5, ao criar conta, vincula-se `auth_user_id` ao perfil.
- **Chaves compostas `(id, office_id)`:** toda ligação entre tabelas (documento→processo, análise→processo, consulta→documento etc.) também confere o escritório. Assim é impossível ligar, por erro de código, um dado da Silva a um dado de outro escritório.
- **Funções auxiliares no schema `private`** (`current_office_id`, `current_profile_id`, `current_role_name`), com `security definer`, para não ficarem expostas na API.
- **Status, tipos e funções guardados como texto** com `check` (os mesmos textos das telas: "Em andamento", "Cível", "Advogado"...). Simples agora; pode virar enum/código em inglês depois.
- **Permissões (RLS):** todos veem o escritório; todos enviam documentos e registram consultas (só em nome próprio); Administrador e Advogado cadastram/editam processos e análises; só o Administrador gerencia equipe e configurações.
- `anon` (visitante sem login) não tem acesso a nenhuma tabela. Tabelas novas criadas depois precisam repetir os `grant` do fim da seção de segurança do `01_schema.sql`.

### Tabelas

`offices`, `profiles`, `processes`, `documents` (com `storage_path` para a Fase 8), `process_events`, `analyses`, `analysis_items` (cada item com documento e página de origem), `consultations`, `deadlines`.

### Próximos passos

1. Caio sobe a pasta `supabase/` no GitHub (os 3 arquivos `.sql`) e o `PROJETO.md` atualizado.
2. Caio roda no Supabase (SQL Editor), nesta ordem: `01_schema.sql`, `02_dados_ficticios.sql`, `03_teste_isolamento.sql`.
3. Caio confere: o 02 mostra 128 / 768 / 640 / 128 / 1152 / 256 / 3 / 5; o 03 mostra 24 linhas com ✅ OK. Se algo falhar, avisar com o texto do erro.
4. **Fase 5:** autenticação (Supabase Auth), vincular o login de Caio ao perfil `Caio Henrique`, e trocar `lib/mock-*.ts` por consultas ao banco. Vai exigir a URL do projeto e a chave `anon` (nunca a `service_role`) nas variáveis de ambiente da Vercel.

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
