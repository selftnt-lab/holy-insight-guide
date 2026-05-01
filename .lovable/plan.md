# Estudo Profundo — Palavras Originais & Strong's Concordance

Transformar a leitura em uma experiência tipo **Blue Letter Bible** simplificada: tocar em qualquer palavra do versículo abre um painel com a palavra original (hebraico/grego), transliteração, pronúncia, código Strong, significados e ocorrências, complementado por uma explicação linguística da IA.

## Estratégia geral

A funcionalidade depende de um **mapeamento palavra-em-português → Strong**. Como a Almeida não vem com tags Strong embutidas, vamos resolver isso **sob demanda via IA + cache permanente no banco**, evitando a necessidade de importar uma base completa de Strong's logo no início. A cada nova palavra consultada, o resultado fica armazenado e é instantâneo nas próximas vezes.

```text
[usuário toca palavra]
        ↓
[verifica cache no banco por (livro, cap, vers, palavra_pt)]
        ↓ miss
[edge function "word-study" → IA com tool calling]
        ↓
[grava em strong_entries + verse_word_map]
        ↓
[painel exibe: original, translit, Strong, significados, IA contextual]
```

## Banco de dados (novas tabelas)

1. **`strong_entries`** — dicionário Strong (cache acumulativo)
   - `strong_code` (PK, ex: `G3056`, `H7225`)
   - `language` (`hebrew` | `greek` | `aramaic`)
   - `original` (texto original: λόγος / רֵאשִׁית)
   - `transliteration` (`logos`, `reshit`)
   - `pronunciation` (`LO-gos`)
   - `short_definition`
   - `full_definition` (texto longo)
   - `part_of_speech`
   - `created_at`

2. **`verse_word_map`** — vínculo palavra-PT ↔ Strong em cada versículo
   - `id`, `book_slug`, `chapter`, `verse`, `word_index` (posição da palavra no versículo)
   - `word_pt` (palavra como aparece em PT)
   - `strong_code` (FK → strong_entries)
   - `context_meaning` (nuance específica neste versículo)
   - UNIQUE(book_slug, chapter, verse, word_index)

3. **`word_study_cache`** — cache do painel completo por (versículo, palavra) já renderizado
   - `id`, `book_slug`, `chapter`, `verse`, `word_pt`, `payload` (jsonb), `updated_at`

**RLS:** leitura liberada para `authenticated`; escrita apenas pela edge function (service role).

## Edge Functions

### `word-study` (nova)
- **Input:** `{ bookSlug, chapter, verse, verseText, wordPt, wordIndex }`
- **Fluxo:**
  1. Consulta `word_study_cache` — se existir, retorna direto.
  2. Caso contrário, chama Lovable AI (`google/gemini-2.5-flash`) com **tool calling** forçado:
     ```text
     return_word_study({
       strong_code, language, original, transliteration,
       pronunciation, short_definition, full_definition,
       part_of_speech, context_meaning,
       secondary_meanings: string[],
       contextual_explanation: string  // técnico/linguístico, sem viés doutrinário
     })
     ```
  3. Persiste em `strong_entries`, `verse_word_map` e `word_study_cache`.
  4. Retorna o payload.
- **Prompt da IA** instruirá: foco linguístico/técnico, evitar interpretações denominacionais, basear em léxicos clássicos (BDB, Thayer, Strong).

### `strong-lookup` (nova)
- **Input:** `?code=G3056` ou `?q=amor`
- **Fluxo:**
  - Por código: retorna entrada + lista de `verse_word_map` (ocorrências em capítulos já estudados).
  - Por significado em PT: busca `ILIKE` em `verse_word_map.word_pt` + `strong_entries.short_definition`.
  - Inclui frequência (`count`) e amostra de versículos.

## Frontend

### `Reading.tsx` — tornar palavras clicáveis
Substituir o render atual do versículo (`{v.text}`) por um componente `<ClickableVerse>` que tokeniza o texto em palavras + pontuação. Cada palavra vira um `<button>` com hover/destaque sutil. Manter o clique no número do versículo como hoje (referências cruzadas).

```tsx
<ClickableVerse
  text={v.text}
  onWordClick={(word, index) => setActiveWord({ verse: v.verse, word, index })}
/>
```

### `WordStudyPanel.tsx` (novo) — painel lateral
- Componente baseado em `Sheet` (`side="right"` em desktop, `side="bottom"` em mobile).
- Estados: loading (skeleton), erro, dados.
- Seções:
  1. **Cabeçalho:** palavra PT em destaque + chip do código Strong clicável.
  2. **Original:** texto hebraico/grego grande + transliteração + pronúncia (botão de áudio TTS opcional usando `speechSynthesis`).
  3. **Significados:** principal + lista de secundários.
  4. **No contexto deste versículo:** `context_meaning`.
  5. **Explicação linguística (IA):** `contextual_explanation` em markdown.
  6. **Ocorrências:** botão "Ver outras ocorrências" → abre `StrongDetailSheet`.
- Botão "Aprofundar com Tutor IA" que abre `AiChat` com `topic` pré-preenchido (`Estudo de "λόγος" (G3056)`).

### `StrongDetailSheet.tsx` (novo)
Aberto ao clicar no código Strong. Mostra definição completa + lista paginada de ocorrências (com link para navegar até o capítulo/versículo).

### Aba Explorar — barra de busca expandida
Adicionar um **toggle de modo** na barra existente:
- **Modo "Pergunta livre"** (atual) → AiChat
- **Modo "Palavra/Strong"** → chama `strong-lookup`, mostra resultados em lista (palavra original, Strong, definição curta, frequência, versículos).

### Performance
- **Lazy loading:** `WordStudyPanel` e `StrongDetailSheet` via `React.lazy`.
- **Cache local:** React Query (`@tanstack/react-query` já instalado) com `staleTime: Infinity` por `(book, chapter, verse, word)`.
- **Pré-busca opcional:** ao abrir um capítulo, consultar `verse_word_map` em lote (1 query) para destacar palavras já mapeadas com um sublinhado sutil.

## IA — diretrizes do prompt

Sistema:
> Você é um assistente linguístico bíblico. Forneça dados técnicos sobre a palavra original (hebraico/grego/aramaico) baseados em léxicos clássicos (Strong, BDB, Thayer, BDAG). **Nunca** insira interpretações denominacionais ou doutrinárias. Foco: morfologia, semântica, uso no contexto literário e histórico. Se não houver certeza sobre o código Strong correto, indique a palavra mais provável.

Modelo: `google/gemini-2.5-flash` (rápido, cobertura suficiente para léxico). Fallback: `gemini-2.5-pro` se a chamada falhar com baixa confiança.

## Limitações honestas

- A IA pode **errar o código Strong** em palavras ambíguas (preposições, conjunções). Mitigação: marcar `confidence` no payload e exibir "verificado pela comunidade" apenas quando >0.8.
- Não vamos importar a base completa de Strong's de início — o cache cresce orgânico. Em uma fase futura, podemos popular via seed (~14k entradas) se necessário.
- TTS de hebraico/grego usa `speechSynthesis` do navegador (qualidade variável) — opcional, com fallback de pronúncia escrita.

## Arquivos afetados

**Novos**
- `supabase/migrations/<timestamp>_word_study.sql` — 3 tabelas + RLS
- `supabase/functions/word-study/index.ts`
- `supabase/functions/strong-lookup/index.ts`
- `src/components/ClickableVerse.tsx`
- `src/components/WordStudyPanel.tsx`
- `src/components/StrongDetailSheet.tsx`
- `src/hooks/useWordStudy.ts`
- `src/hooks/useStrongLookup.ts`

**Editados**
- `src/pages/Reading.tsx` — usar `ClickableVerse` + montar `WordStudyPanel`
- `src/pages/Explore.tsx` — adicionar toggle "Pergunta livre / Buscar palavra"

## Entrega em fases (sugerido)

1. **MVP:** tabelas + `word-study` + `ClickableVerse` + `WordStudyPanel` (palavra → original/Strong/significado/IA).
2. **Strong detalhe:** `StrongDetailSheet` + ocorrências.
3. **Busca:** `strong-lookup` + modo de busca em Explorar.
4. **Polimento:** TTS de pronúncia, pré-destaque de palavras já mapeadas, badge de confiança.

Posso começar pela Fase 1 assim que aprovar.
