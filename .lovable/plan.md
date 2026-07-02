
# Reestruturação Visual — RC Bible

Escopo estritamente visual: troca de logo e refino da paleta Light/Dark. **Nenhuma alteração** em rotas, componentes, botões, layout ou conteúdo textual.

## 1. Substituição da logo

A logo atual "NOVUS Insight" será substituída pela **RC Bible / Renovada Church** (imagem anexa com o símbolo de raízes/ramos).

Arquivos afetados (apenas troca do `src` da imagem, sem alterar tamanhos, classes ou posicionamento):

- `src/assets/novus-insight-logo.png` → substituído pela nova logo RC Bible (arquivo `rc-bible-logo.png`)
- `src/components/AppHeader.tsx` — mantém `h-20 w-auto object-scale-down`, apenas o `import` e `alt="RC Bible - Renovada Church"`
- `src/pages/Auth.tsx` — mesma troca de import + alt
- `index.html` — atualiza `<title>`, `meta description`, `og:title`, `og:description`, `apple-touch-icon` referências textuais de "NOVUS Insight" → "RC Bible"
- `public/manifest.webmanifest` — `name` / `short_name` para "RC Bible"
- **Favicon**: gerar `public/favicon.png` a partir do símbolo da logo e remover `public/favicon.ico`

**Rodapé "Um produto NOVUS.AI" permanece intocado** (é a assinatura da produtora, não a marca do app). Arquivos `AppFooter.tsx` e `BottomNav.tsx` continuam usando `novus-ai-logo.png`.

## 2. Refino Light/Dark (paleta RC Bible)

A imagem de referência mostra um dark **preto profundo com branco puro** (estética Apple-like, monocromática). Vou refinar os tokens em `src/index.css` mantendo a **estrutura de tokens semânticos existente** — nenhum componente precisa mudar.

### Dark mode (destaque — combina com o mock)
```
--background:  0 0% 4%          /* preto profundo #0a0a0a */
--card:        0 0% 8%          /* #141414 */
--popover:     0 0% 8%
--foreground:  0 0% 98%         /* branco */
--muted:       0 0% 12%
--muted-foreground: 0 0% 65%
--primary:     0 0% 98%         /* branco (CTAs) */
--primary-foreground: 0 0% 6%
--accent:      210 15% 75%      /* cinza-azulado suave para hover/destaque */
--border:      0 0% 16%
--ring:        0 0% 40%
--gradient-sacred: linear-gradient(135deg, hsl(0 0% 8%), hsl(0 0% 14%))
```

### Light mode (mantido coerente, mas afinado)
```
--background:  0 0% 99%         /* branco puro-off */
--foreground:  0 0% 8%
--card:        0 0% 100%
--muted:       0 0% 96%
--muted-foreground: 0 0% 40%
--primary:     0 0% 8%          /* preto (CTAs) */
--primary-foreground: 0 0% 98%
--accent:      210 20% 45%
--border:      0 0% 90%
--ring:        0 0% 20%
```

### Toggle Light/Dark
Já existe `ThemeProvider` funcional (`src/components/ThemeProvider.tsx`) com persistência em `localStorage`. **Nada muda** — só refino de tokens.

## 3. O que NÃO será alterado

- Nenhuma estrutura de página, rota, ou componente
- Nenhum botão, ícone ou posição de elemento
- Nenhum texto do app (exceto `alt`/meta com "NOVUS Insight" → "RC Bible")
- Fontes (Lora + Inter) permanecem
- Rodapé "Um produto NOVUS.AI" permanece
- Edge functions, hooks, banco: intocados

## Detalhes técnicos

- Upload `user-uploads://Gemini_Generated_Image_wbn275wbn275wbn2.png` (versão completa com "RC BIBLE / RENOVADA CHURCH") vira `src/assets/rc-bible-logo.png` (usada no header e login).
- `user-uploads://images.png` (só o símbolo) vira `public/favicon.png`.
- Substituição via `code--copy` — sem lovable-assets, pois já é convenção do projeto usar imports diretos de `src/assets/`.
- Após edições em `index.html` / `manifest.webmanifest`, nenhum deploy de função necessário.

## Entregáveis

1. Nova logo RC Bible em `src/assets/rc-bible-logo.png`
2. Novo favicon em `public/favicon.png` (+ remoção do `.ico`)
3. Tokens de `index.css` refinados (Light + Dark)
4. Imports e `alt`s atualizados em `AppHeader.tsx` e `Auth.tsx`
5. Metadata textual atualizada em `index.html` e `manifest.webmanifest`
