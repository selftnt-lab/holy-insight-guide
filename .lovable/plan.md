# Repaginação Visual RC Bible — Editorial Serif

Aplicar a estética da tela de referência (serifa editorial grande, muito whitespace, divisores minimalistas, cards com borda suave) em **todas** as telas do app. Estrutura, conteúdo, posição de botões e navegação permanecem inalterados — só muda a camada visual.

## Direção visual

- **Tipografia:** DM Serif Display (títulos, saudações, versículos em destaque) + Fira Sans (corpo, UI, labels, botões). Carregadas via `@fontsource` em `src/main.tsx`.
- **Paleta (Light — padrão):**
  - Background `#FAFAF8` (off-white quente sutil)
  - Foreground `#1A1A1A`
  - Muted text `#6B6B6B`
  - Border `#E8E6E1`
  - Card `#FFFFFF`
  - **Accent teal (da logo)** `#4A8B8C` — usado em links, ícones ativos, streak, badges, ring de foco, divisores decorativos
  - Accent-foreground `#FFFFFF`
- **Paleta (Dark — toggle):**
  - Background `#0D0D0D`, foreground `#F5F5F0`, border `#1F1F1F`, card `#141414`, muted `#8A8A85`
  - Accent teal levemente clareado `#6BB0B1` para contraste
- **Componentes:**
  - Cards: borda 1px `border`, radius `0.75rem`, sombra quase inexistente (`0 1px 2px hsl(0 0% 0% / 0.04)`)
  - Divisores: linha fina com pequeno ícone central (já existe em `SacredDivider` — repintado com accent teal)
  - Labels de seção: uppercase, tracking wide, 11px, cor muted (ex: "SEQUÊNCIA ATIVA", "DEVOTIONAL DE HOJE")
  - Saudações em serifa 36px+ com quebra de linha natural ("Bom dia, / MAXWELL")
- **Modo padrão:** Claro. Toggle permanece no Perfil. Sem detecção automática de SO.

## Escopo de arquivos

**Design tokens (base de tudo):**
- `src/index.css` — reescrever variáveis `:root` e `.dark` com paleta acima; ajustar `--gradient-*` e `--shadow-scripture` para o novo tom; adicionar `--font-serif` e `--font-sans`.
- `tailwind.config.ts` — trocar `fontFamily.serif` para `DM Serif Display` e `sans` para `Fira Sans`; adicionar utilitário se necessário.
- `src/main.tsx` — importar `@fontsource/dm-serif-display` e `@fontsource/fira-sans` (pesos 300/400/500/600/700).
- `package.json` — adicionar `@fontsource/dm-serif-display` e `@fontsource/fira-sans` via `bun add`.
- Remover `@import` do Google Fonts (`Lora`, `Inter`) em `index.css`.

**Telas repaginadas (só camada visual, sem mexer em lógica):**
- `src/pages/Dashboard.tsx` — saudação em DM Serif grande, labels uppercase, cards limpos com o novo estilo.
- `src/pages/Reading.tsx` — versículos em DM Serif para números/destaques, corpo em Fira Sans, ajuste do modo imersivo.
- `src/pages/Explore.tsx`, `src/pages/Plans.tsx`, `src/pages/Journal.tsx`, `src/pages/Profile.tsx`, `src/pages/ChatHistory.tsx`, `src/pages/Search.tsx` — títulos serif, cards no novo padrão, accent teal em elementos ativos.
- `src/pages/Auth.tsx` — logo já grande, título em serif, botões e inputs no novo tom.
- `src/pages/legal/*.tsx` — tipografia editorial coerente.

**Componentes tocados:**
- `src/components/AppHeader.tsx` — mantém logo centralizada; separador inferior fininho na cor border.
- `src/components/AppFooter.tsx` — tipografia Fira Sans, cor muted mais sutil.
- `src/components/BottomNav.tsx` — item ativo em accent teal, inativo em muted; label em Fira Sans.
- `src/components/SacredDivider.tsx` — repintado com accent teal a 50%.
- `src/components/StreakBadge.tsx`, `DevotionalCard.tsx`, `VerseOfDayCard.tsx` — cards no novo padrão, labels uppercase, valores em DM Serif.
- `src/components/ui/button.tsx` — variantes ajustadas ao novo accent; default = primary escuro, secondary = outline sutil.
- `src/components/ui/card.tsx`, `input.tsx`, `tabs.tsx` — checar bordas e radius alinhados aos tokens.

**Metadata:**
- `index.html` — `theme-color` para `#FAFAF8` (light).
- `public/manifest.webmanifest` — `background_color` e `theme_color` para `#FAFAF8`.

## Regras de execução

1. **Zero mudança de conteúdo, layout ou comportamento.** Só CSS, tokens, tipografia e classes.
2. **Nenhuma cor hardcoded** em componentes — tudo passa por tokens semânticos (`bg-background`, `text-foreground`, `text-accent`, `border-border`, etc.).
3. **Sem gradientes decorativos**, sem sombras dramáticas, sem "glow". Estética editorial calma.
4. Ícones Lucide mantidos; peso `1.5`, tamanho consistente.
5. Verificar via Playwright após aplicação: Home, Leitura, Perfil (light e dark).

## Detalhes técnicos

```ts
// tailwind.config.ts
fontFamily: {
  sans: ["'Fira Sans'", "system-ui", "sans-serif"],
  serif: ["'DM Serif Display'", "Georgia", "serif"],
}
```

```css
/* index.css :root */
--background: 48 20% 97%;
--foreground: 0 0% 10%;
--card: 0 0% 100%;
--muted-foreground: 0 0% 42%;
--border: 40 12% 90%;
--primary: 0 0% 10%;
--accent: 182 30% 42%;   /* teal da logo */
--accent-foreground: 0 0% 100%;
--ring: 182 30% 42%;
--radius: 0.75rem;
```

```css
/* .dark */
--background: 0 0% 5%;
--foreground: 40 15% 94%;
--card: 0 0% 8%;
--border: 0 0% 12%;
--accent: 182 30% 55%;
```

Quando aprovar, executo tudo em uma passada, rodo typecheck e valido as telas principais com screenshot.
