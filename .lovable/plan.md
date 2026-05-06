## Objetivo

Adicionar um histórico persistente das últimas 10 interações do usuário com o Tutor IA, com opção de excluir o histórico a qualquer momento.

## Comportamento

- Cada conversa (abertura do chat até fechamento) é salva como uma "interação" contendo a lista de mensagens trocadas, contexto (livro/capítulo ou tópico) e timestamp.
- Mantém **no máximo 10 interações por usuário**. Ao salvar a 11ª, a mais antiga é descartada automaticamente.
- O usuário pode:
  - **Ver** o histórico em uma nova tela/painel ("Histórico do Tutor IA").
  - **Reabrir** uma interação antiga (somente leitura, sem continuar a conversa — mantém escopo simples).
  - **Excluir** uma interação individual.
  - **Limpar tudo** com um botão "Apagar histórico".

## Estrutura técnica

### Banco (nova tabela)

`chat_history`
- `id uuid pk`
- `user_id uuid` (RLS: dono)
- `context jsonb` (book/chapter/topic)
- `title text` (ex: "Mateus 28" ou nome do tópico)
- `messages jsonb` (array `{role, content}`)
- `created_at timestamptz`

RLS: SELECT/INSERT/DELETE apenas para `auth.uid() = user_id`.

Trigger `BEFORE INSERT`: após inserir, deleta linhas excedentes do mesmo `user_id` mantendo as 10 mais recentes (`ORDER BY created_at DESC OFFSET 10`).

### Frontend

- **`AiChat.tsx`**: ao fechar o chat (se houve ≥1 mensagem do usuário), faz `INSERT` em `chat_history`.
- **Nova página `src/pages/ChatHistory.tsx`** (rota `/historico-ia`):
  - Lista as 10 interações (título, data, prévia da 1ª pergunta).
  - Botões: abrir (modal somente leitura reaproveitando layout do `AiChat`), excluir item, limpar tudo (com confirmação `AlertDialog`).
- **Acesso**: link no `Profile.tsx` ("Histórico do Tutor IA") — sem mexer em `BottomNav` para não alterar navegação principal.

### Arquivos a criar/editar

- `supabase/migrations/...` — tabela + RLS + função/trigger de cap.
- `src/components/AiChat.tsx` — salvar ao fechar; aceitar prop `readOnly` e `initialMessages`.
- `src/pages/ChatHistory.tsx` — nova página.
- `src/App.tsx` — registrar rota protegida.
- `src/pages/Profile.tsx` — entrada para a página.

## Fora de escopo

- Continuar conversas antigas (apenas visualização).
- Busca/filtro no histórico.
- Sincronização realtime entre dispositivos (a leitura simples já cobre).
