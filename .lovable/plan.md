## Fase 2 — Estudo profundo

Três frentes integradas que transformam o app de "leitor bíblico" em "ferramenta de estudo".

---

### 1. Destaques e anotações por versículo

**O que o usuário ganha:**
- Tocar 1x no número do versículo → abre as referências cruzadas (já existe).
- Tocar e segurar no versículo → abre menu rápido: **Destacar** (4 cores), **Anotar**, **Copiar**, **Compartilhar imagem**.
- Destaque fica salvo e aparece automaticamente toda vez que volta ao capítulo.
- Anotações pessoais com texto livre + tags opcionais (ex: "fé", "graça", "estudo dominical").
- Nova aba **"Meus destaques"** no Perfil: lista todos os destaques/notas, filtrável por livro, cor ou tag, com link para o versículo.

**Detalhes técnicos:**
- Nova tabela `verse_highlights` (user_id, book_slug, chapter, verse, color, note, tags[]).
- RLS: usuário só vê/edita os próprios.
- Hook `useChapterHighlights(book, chapter)` carregando uma vez por capítulo e mesclando ao render dos versículos.
- Menu de ação: componente `VerseActionSheet` (Sheet bottom do shadcn) com paleta de 4 cores (amarelo/verde/azul/rosa em tokens semânticos).

---

### 2. Comparação de traduções

**O que o usuário ganha:**
- Botão "Comparar" no header da página de leitura.
- Abre painel lateral mostrando o **mesmo capítulo lado a lado** em até 3 traduções escolhidas.
- Versões disponíveis (todas gratuitas via bible-api.com): **Almeida (PT)**, **King James (EN)**, **WEB (EN)**, **ASV (EN)**.
- Preferência salva no perfil: traduções favoritas para comparação rápida.
- No menu de ação do versículo: opção "Ver em outras versões" abre comparação só daquele versículo.

**Detalhes técnicos:**
- Edge function `bible` ganha parâmetro `translation` (default `almeida`).
- Cache em memória já existente passa a indexar por `book:chapter:translation`.
- Novo componente `TranslationComparison` (Sheet lateral) usando `useBibleChapter` em paralelo para cada tradução.
- Coluna `preferred_translations` (text[]) em `profiles`.

---

### 3. Busca global

**O que o usuário ganha:**
- Lupa fixa no header.
- 3 modos automáticos detectados pelo input:
  - **Referência**: "jo 3:16" ou "salmos 23" → navega direto.
  - **Texto**: "pelo amor de Deus" → lista todos os versículos com a expressão.
  - **Strong**: "G26" → reaproveita o `useStrongSearch` existente.
- Resultados clicáveis levam ao versículo destacado.
- Histórico de últimas 10 buscas no localStorage.

**Detalhes técnicos:**
- Página `/search` com SearchBar reutilizável.
- Para busca por texto: nova edge function `bible-search` que faz fetch on-demand e cacheia capítulos já varridos (busca incremental por livro selecionado para evitar 1.189 fetches; default: testamento atual baseado em `reading_progress`).
- Parser de referências aceita formatos PT comuns: "gn 1", "1 co 13", "salmo 23:1-6".
- Em iteração futura, fazer index full-text no Postgres (fora do escopo desta fase para entregar rápido).

---

### Telas alteradas/criadas

```text
Reading.tsx           +Comparar  +VerseActionSheet
AppHeader.tsx         +ícone de busca
src/pages/Search.tsx  (novo)
src/pages/Profile.tsx +aba "Meus destaques"
src/components/
  VerseActionSheet.tsx        (novo)
  TranslationComparison.tsx   (novo)
  HighlightsList.tsx          (novo)
  SearchBar.tsx               (novo)
src/hooks/
  useChapterHighlights.ts     (novo)
src/lib/
  reference-parser.ts         (novo — parse "jo 3:16")
supabase/functions/
  bible/index.ts              edita: suporta ?translation=
  bible-search/index.ts       (novo)
```

### Banco

- `CREATE TABLE verse_highlights` com RLS por `auth.uid()`.
- `ALTER TABLE profiles ADD COLUMN preferred_translations text[] DEFAULT '{almeida,kjv}'`.

### Ordem de entrega (numa única iteração)

1. Migration (tabela + coluna).
2. Edge function `bible` aceita `translation` + nova `bible-search`.
3. Hook de destaques + `VerseActionSheet` + render colorido na leitura.
4. `TranslationComparison` + botão no header de leitura.
5. Página `/search` + SearchBar no `AppHeader`.
6. Aba "Meus destaques" no Perfil.

Pronto para implementar quando você aprovar.