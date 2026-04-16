

## Diagnóstico

Confirmei que o app hoje é praticamente uma casca visual:

- **Leitura (`Reading.tsx`)**: só mostra 5 versículos de Gênesis 1 codificados manualmente. Não há livro, capítulo, navegação nem texto bíblico real.
- **Dashboard / Perfil / Explorar**: tudo é mock estático ("Maxwell", "3 de 50 capítulos", lugares com gradientes coloridos em vez de imagens reais, estatísticas fixas).
- **Tutor IA (`AiChat.tsx` + edge function `chat`)**: o código de streaming está correto e a `LOVABLE_API_KEY` existe nos secrets. A causa mais provável de "não funcionar" é o modelo `google/gemini-3-flash-preview` (preview) estar instável/indisponível, sem fallback nem log claro no front. Sem console/network logs no replay, vou estabilizar trocando para um modelo estável + melhor tratamento de erro.

## O que vou fazer

### 1. Bíblia real integrada (ARC – Almeida Revista e Corrigida, domínio público)

Usar a API pública gratuita **bible-api.com** (suporta versão `almeida` em português, sem chave). Para evitar CORS e travamentos do front, criar uma edge function `bible` que faz proxy + cache em memória.

- Nova edge function `supabase/functions/bible/index.ts`:
  - `GET ?book=genesis&chapter=1` → retorna `{ reference, verses: [{ verse, text }] }`.
  - Faz `fetch` em `https://bible-api.com/<book>+<chapter>?translation=almeida`.
  - CORS liberado, cache simples por chave `book:chapter`.
- Lista de livros (66) hardcoded no front com nome PT + slug API + nº de capítulos.

### 2. Tela de Leitura funcional

Reescrever `Reading.tsx`:
- Seletor de **Livro** (Sheet com lista dos 66 livros) e seletor de **Capítulo** (grid numérico).
- Botões ◀ ▶ para capítulo anterior/próximo.
- Carrega versículos via edge function `bible`, com skeleton de loading e tratamento de erro.
- Estado persistido em `localStorage` (último livro/capítulo lido) → o botão "Continuar Leitura" do Dashboard usa isso.
- Mantém o FAB do Tutor IA, agora passando o contexto real (livro + capítulo + texto) para o chat.
- Dicionário fica como tooltip opcional só nas palavras conhecidas (sem quebrar o texto vindo da API).

### 3. Tutor IA estável

- Trocar modelo padrão para `google/gemini-2.5-flash` (estável, já incluso no plano) com fallback para `google/gemini-2.5-flash-lite` em caso de erro.
- A edge function `chat` recebe agora `{ messages, context: { book, chapter, text } }` e injeta o texto bíblico no system prompt — assim o tutor responde sobre o que o usuário está lendo.
- Front (`AiChat.tsx`):
  - Passa o contexto de leitura.
  - Mostra mensagem de erro real no balão (não só toast) quando 429/402/500.
  - Renderiza markdown nas respostas (`react-markdown`) para listas/negrito ficarem legíveis.

### 4. Dashboard ligado ao real

- "Trilha: Gênesis – X de 50" vira "Último capítulo lido: <Livro> <Cap>" lido do `localStorage`.
- Botão "Continuar Leitura" navega para `/reading?book=...&chapter=...`.
- Estatísticas locais simples (capítulos lidos, sequência) baseadas em `localStorage`.

### 5. Explorar — fora de escopo agora

Você marcou só **Leitura real** + **Chat real**. Mantenho a tela Explorar como está (mock visual) e deixo nota para uma próxima iteração trocar por conteúdo real com imagens.

## Arquivos afetados

- **Criar**: `supabase/functions/bible/index.ts`, `src/lib/bible-books.ts`, `src/lib/reading-progress.ts`, `src/hooks/useBibleChapter.ts`
- **Editar**: `src/pages/Reading.tsx`, `src/pages/Dashboard.tsx`, `src/components/AiChat.tsx`, `supabase/functions/chat/index.ts`
- **Dependência nova**: `react-markdown`

## Fora deste passo

- Autenticação e progresso salvo no banco (posso fazer depois se quiser sair do `localStorage`).
- Conteúdo real da aba Explorar.
- Áudio do "Contexto do Dia" (botão hoje é decorativo).

