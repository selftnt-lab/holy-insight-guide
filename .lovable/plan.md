## Objetivo

Adicionar uma barra de pesquisa no topo da aba **Explorar** que funciona como um "GPT bíblico" — permite ao usuário fazer qualquer pergunta livre (não restrita ao capítulo atual), abrindo o Tutor IA com a pergunta como prompt inicial.

## Comportamento

- Campo de busca fixo no topo, acima dos cards de sugestões.
- Placeholder: "Pergunte qualquer coisa sobre a Bíblia..."
- Ícone de lupa à esquerda; botão de enviar (ou Enter) dispara a consulta.
- Ao enviar:
  - Abre o `AiChat` (mesmo componente já usado pelos cards) com `topic.initialPrompt = textoDigitado`.
  - `topicName` = "Pergunta livre" e `description` = primeiros ~80 chars da pergunta.
  - Limpa o campo após envio.
- Validação: ignora envio se vazio ou só espaços; trim antes de mandar.
- Sugestões rápidas (chips) abaixo do input para inspirar perguntas: "O que é graça?", "Quem foi Paulo?", "Por que existem 4 evangelhos?", "O que é o Reino de Deus?". Clicar preenche o input (não envia direto, para o usuário poder editar).

## Arquivos

**Editar `src/pages/Explore.tsx`:**
- Adicionar estado `query: string`.
- Renderizar bloco de busca entre o header e o botão "Atualizar":
  - `<Input>` + `<Button size="icon">` com ícone `Send`/`Sparkles`.
  - `<form onSubmit>` para suportar Enter.
  - Linha de chips (botões `variant="outline" size="sm"`) com prompts pré-definidos.
- Função `handleAsk(text)` que valida, define `setTopic({ topicName: "Pergunta livre", description: text.slice(0,80), initialPrompt: text })` e limpa o input.

## Observações técnicas

- Nenhuma mudança de backend: o `AiChat` já chama a edge function `chat`, que aceita prompts arbitrários sem precisar de contexto de capítulo (o `topic` é opcional no system prompt).
- Sem nova tabela, sem nova edge function, sem alteração no schema.
- Mantém os cards dinâmicos atuais intactos abaixo da busca.
