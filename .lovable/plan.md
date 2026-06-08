# Fase 4 — Estudo guiado por IA

Transforma a leitura passiva em estudo dirigido. Quatro recursos que usam Lovable AI para gerar conteúdo doutrinariamente alinhado (já temos o system prompt confessional 1689 na função `chat`).

---

## 1. Resumo de capítulo (companion de leitura)

**O que o usuário ganha:**
- Botão **"Estudar com IA"** no header da `Reading.tsx` abre um Sheet lateral.
- Sheet mostra 4 abas: **Contexto**, **Temas**, **Esboço**, **Aplicação** — geradas com base no texto carregado.
- Cache por usuário+capítulo: nunca regenera o mesmo capítulo, abre instantâneo na 2ª visita.

**Técnico:**
- Nova edge function `chapter-study` que recebe `{ bookSlug, chapter, text }` e retorna JSON estruturado `{ context, themes, outline, application }`.
- Tabela `chapter_studies (user_id, book_slug, chapter, content jsonb, created_at)` com RLS por usuário e UNIQUE(user_id, book_slug, chapter).
- Hook `useChapterStudy(bookSlug, chapter)` que consulta a tabela primeiro; se vazio, chama a função e salva.

---

## 2. Perguntas reflexivas + diário de respostas

**O que o usuário ganha:**
- Aba **"Reflexão"** dentro do mesmo Sheet de estudo: 4–6 perguntas reflexivas geradas a partir do capítulo.
- Cada pergunta tem campo de resposta livre (autosave); ícone de check quando respondida.
- Página `/profile` ganha link **"Meu diário"** que lista as respostas agrupadas por capítulo.

**Técnico:**
- A mesma função `chapter-study` retorna também `questions: string[]` no JSON.
- Tabela `reflection_answers (user_id, book_slug, chapter, question_index, question text, answer text, updated_at)`. RLS por usuário; UNIQUE(user_id, book_slug, chapter, question_index).
- Autosave com debounce 800ms; toast discreto ao salvar.

---

## 3. Devocional diário personalizado

**O que o usuário ganha:**
- Card no Dashboard **"Devocional de hoje"** com: versículo do dia (já temos), meditação curta (3–4 frases), 1 pergunta reflexiva, sugestão de oração.
- Gerado uma vez por dia por usuário; mesmo dia = mesmo conteúdo.
- Botão **"Marcar como feito"** que adiciona ao streak.

**Técnico:**
- Edge function `daily-devotional` recebe `{ date, verseRef, verseText }` e retorna `{ meditation, question, prayer }`.
- Tabela `daily_devotionals (user_id, date, verse_ref, content jsonb, completed_at)`. RLS por usuário; UNIQUE(user_id, date).
- Substitui (ou complementa) o `VerseOfDayCard` atual com um card mais rico.

---

## 4. Planos temáticos gerados por IA

**O que o usuário ganha:**
- Na página `/plans`, novo botão **"Criar plano personalizado"**.
- Diálogo pede: tema (ex.: "ansiedade", "graça", "liderança"), duração (7/14/21/30 dias), nível (iniciante/intermediário/avançado).
- IA gera um plano com leituras diárias (livro+capítulo+versículos) e uma reflexão curta por dia.
- Plano salvo aparece na lista de planos do usuário; progresso usa o `user_plan_progress` existente.

**Técnico:**
- Edge function `generate-plan` retorna `{ title, description, days: [{ day, reference, reflection }] }` validado via schema.
- Insere em `reading_plans` (já existe) com `user_id` preenchido e flag `ai_generated boolean default false` (nova coluna).
- Reaproveita componentes existentes de `Plans.tsx`.

---

## Arquivos

```text
src/
  components/
    StudySheet.tsx                   (novo — Sheet lateral com 4 abas + reflexão)
    DevotionalCard.tsx               (novo — substitui/aumenta VerseOfDayCard no Dashboard)
    CreatePlanDialog.tsx             (novo — wizard de criação de plano)
  hooks/
    useChapterStudy.ts               (novo)
    useDailyDevotional.ts            (novo)
    useReflectionAnswers.ts          (novo)
  pages/
    Reading.tsx                      edita: botão "Estudar com IA" + integração StudySheet
    Dashboard.tsx                    edita: troca VerseOfDayCard por DevotionalCard
    Plans.tsx                        edita: botão "Criar plano personalizado"
    Profile.tsx                      edita: link "Meu diário de reflexões"
    Journal.tsx                      (novo — lista de respostas agrupadas)
  App.tsx                            edita: rota /journal

supabase/functions/
  chapter-study/index.ts             (novo)
  daily-devotional/index.ts          (novo)
  generate-plan/index.ts             (novo)

supabase/migrations/
  <timestamp>_ai_study_tables.sql    (novo)
```

## Banco (migração única)

```text
chapter_studies      (user_id, book_slug, chapter, content jsonb)
reflection_answers   (user_id, book_slug, chapter, question_index, question, answer)
daily_devotionals    (user_id, date, verse_ref, content jsonb, completed_at)
reading_plans        ADD COLUMN ai_generated boolean DEFAULT false
```

- RLS: cada tabela com policy `auth.uid() = user_id` para SELECT/INSERT/UPDATE/DELETE.
- GRANTs para `authenticated` e `service_role` (edge functions).
- UNIQUE constraints para cache idempotente.

## Modelo de IA

- `google/gemini-2.5-flash` para `chapter-study` e `generate-plan` (resposta longa estruturada).
- `google/gemini-2.5-flash-lite` para `daily-devotional` (curto, alto volume).
- Todas as funções reaproveitam o **system prompt confessional 1689** já presente em `supabase/functions/chat/index.ts` (vamos extrair para `supabase/functions/_shared/system-prompt.ts`).
- Saída estruturada via `response_format: { type: "json_schema" }` quando o gateway aceitar, com fallback para parse de JSON cru.

## Considerações

- **Custo:** cache agressivo em DB garante 1 chamada por capítulo por usuário e 1 por dia (devocional). Planos só geram sob ação explícita.
- **Latência:** Sheet abre com skeleton; resposta típica 2–5s. Mostra "Gerando estudo do capítulo..." com spinner.
- **Erros 429/402:** tratados com toast ("Tente novamente em alguns segundos" / "Créditos esgotados").
- **Privacidade:** respostas do diário são por usuário, nunca expostas a outros (RLS estrita).

## Ordem de entrega

1. Migration (`chapter_studies`, `reflection_answers`, `daily_devotionals`, `reading_plans.ai_generated`) + extração do system prompt compartilhado.
2. Edge function `chapter-study` + `useChapterStudy` + `StudySheet` (abas Contexto/Temas/Esboço/Aplicação) + botão na `Reading.tsx`.
3. Aba **Reflexão** no StudySheet + `useReflectionAnswers` + página `Journal.tsx`.
4. Edge function `daily-devotional` + `DevotionalCard` substituindo no Dashboard.
5. Edge function `generate-plan` + `CreatePlanDialog` em `Plans.tsx`.
