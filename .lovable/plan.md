# Análise do estado atual

App já completo até a **Fase 4** com:
- Leitura, áudio, destaques, busca, comparação de traduções, Strong, referências cruzadas.
- Tutor IA (`/functions/chat`) + estudo de capítulo, devocional diário, reflexões/Journal, planos por IA.
- Gamificação básica (streak, progresso, planos).
- SEO inicial (sitemap, robots).

Pontos de atrito que valem a próxima fase:
1. **Tutor IA expõe rótulos doutrinários** ("Batista Reformada 1689", lista de autores, "No Holy Insight Guide, seguimos…") no system prompt e nas respostas formatadas. O usuário pediu para remover essas menções nominais — o agente deve **responder com a mesma teologia, sem nomeá-la**.
2. System prompt está **duplicado** entre `chat/index.ts` (hardcoded) e `_shared/system-prompt.ts` (resumido). As funções de estudo/devocional/plano usam o resumido; o chat ignora o compartilhado.
3. Falta consistência confessional nas demais funções de IA (`chapter-study`, `daily-devotional`, `generate-plan`, `word-study`, `cross-references`, `explore-suggestions`) — algumas não importam o prompt compartilhado.
4. Sem **PWA / install prompt**, sem manifest rico — app é mobile-first mas não instalável como nativo.
5. Dashboard sem **continuar de onde parou** com destaque (já existe progresso, mas o card pode evoluir).
6. Busca não tem **histórico recente** persistente nem filtros por Testamento.

---

# Plano — Fase 5: Refinamento doutrinário + Polimento

## 1. Sanitização do tutor IA (prioridade do usuário)

**Objetivo:** o agente continua doutrinariamente alinhado, mas **nunca cita por nome** Confissão de 1689, "Batista Reformada", Spurgeon, Piper, MacArthur, Grudem, Carvalho, Maxwell, nem usa a frase "No Holy Insight Guide, seguimos…".

**Como:**
- Reescrever `supabase/functions/_shared/system-prompt.ts` para uma versão única, completa, **sem rótulos confessionais nominais**. Mantém:
  - Autoridade da Escritura (66 livros, inerrante, suficiente).
  - Hermenêutica histórico-gramatical, cristocêntrica, analogia da fé.
  - Soteriologia monergista (graça, fé, Cristo, Escritura, glória de Deus) descrita por conteúdo, sem batismo de rótulos.
  - Tom pastoral, recusa de relativismo, formato de resposta, segurança pastoral, política de recusa — tudo sem nomear escolas ou autores.
  - Regra explícita: **"Não nomeie tradições, confissões, denominações ou autores como fonte. Ensine pelo conteúdo bíblico em si."**
- `supabase/functions/chat/index.ts`: remover o bloco hardcoded e importar `CONFESSIONAL_SYSTEM_PROMPT` do shared. Mantém a injeção de contexto (capítulo/tópico) e fallback de modelo.
- Auditar `chapter-study`, `daily-devotional`, `generate-plan` para garantir que: (a) importam o shared atualizado; (b) instruções locais não reintroduzem rótulos.
- Auditar `word-study`, `cross-references`, `explore-suggestions` — adicionar o mesmo prompt compartilhado quando produzirem conteúdo doutrinário/devocional.
- Front-end: nenhuma alteração de texto visível por padrão (o nome do app continua no header do chat). Confirmar que `AiChat.tsx` não exibe rótulo confessional.

## 2. Consolidação do sistema de IA

- Centralizar a chamada ao gateway em `supabase/functions/_shared/ai.ts` (helper `callLovableAI(model, payload)` com fallback 5xx, mapeamento 429/402). Refatorar as 6 funções para usá-lo — reduz duplicação e garante tratamento de erro uniforme.
- Adicionar logging conciso (`console.log` com função + status) para facilitar debug no painel.

## 3. UX — Dashboard e leitura

- **Card "Continuar leitura"**: mostra último livro/capítulo lido com botão direto (usa `reading-progress.ts` já existente). Substitui ou acompanha o `DevotionalCard`.
- **Atalho de teclado** na `Reading.tsx`: ← / → para capítulo anterior/próximo (desktop).
- **Indicador de capítulo lido** no seletor de capítulos (check verde nos já lidos).

## 4. Busca e descoberta

- **Histórico de busca recente** em `localStorage` (últimas 8 buscas) exibido como chips abaixo do input em `Search.tsx`.
- **Filtro AT/NT** simples em `Search.tsx`.

## 5. PWA / instalável

- `public/manifest.webmanifest` com ícones (reaproveitar favicon existente, gerar 192/512 se faltar), nome, theme color, display standalone.
- `<link rel="manifest">` em `index.html` + `theme-color` meta.
- Sem service worker complexo nesta fase (evitar cache stale do Vite dev) — só manifest para "Adicionar à tela inicial".

## 6. Acessibilidade e polimento

- Audit rápido: foco visível em todos os botões da `Reading.tsx`, contraste do tema escuro nos cards de estudo, `aria-label` no player de áudio e no botão "Estudar com IA".
- Skeleton consistente no `StudySheet` enquanto a IA gera (já existe, validar).

---

## Detalhes técnicos

```text
supabase/functions/
  _shared/
    system-prompt.ts        reescreve: sem rótulos nominais
    ai.ts                   novo: callLovableAI() com fallback + erros
  chat/index.ts             remove prompt hardcoded, usa shared
  chapter-study/index.ts    refatora p/ usar shared/ai.ts
  daily-devotional/index.ts idem
  generate-plan/index.ts    idem
  word-study/index.ts       garante prompt compartilhado quando aplicável
  cross-references/index.ts idem
  explore-suggestions/index.ts idem

src/
  pages/
    Dashboard.tsx           edita: card "Continuar leitura"
    Reading.tsx             edita: atalhos ← →, check em capítulos lidos
    Search.tsx              edita: histórico recente + filtro AT/NT
  components/
    ContinueReadingCard.tsx novo
  lib/
    search-history.ts       novo (localStorage)

public/
  manifest.webmanifest      novo
index.html                  edita: link manifest + theme-color
```

Sem migrations nesta fase (nenhuma mudança de schema).

## Ordem de entrega

1. Reescrita do `system-prompt.ts` + refator do `chat/index.ts` (entrega o pedido explícito do usuário).
2. `_shared/ai.ts` + refator das funções de IA.
3. Dashboard `ContinueReadingCard` + atalhos de teclado em Reading.
4. Search: histórico recente + filtro AT/NT.
5. PWA manifest.
6. Pequenos ajustes a11y.

## Considerações

- **Sem regressão doutrinária:** o conteúdo continua o mesmo; só a forma de citar muda. Test manual: perguntar "qual confissão vocês seguem?" → o tutor responde sobre os princípios sem nomear escola.
- **Sem mudança visível de UI no chat** além de respostas mais "limpas" de jargão denominacional.
- **Custo zero adicional** — apenas reorganização do prompt e features client-side.