
# Refatoração Visual — Meio-termo entre o app atual e os mockups

**Regras invioláveis (repetidas do pedido):**
- 🔒 Nenhuma mudança estrutural. Nada de mover, remover ou adicionar botões, cards, containers, rotas ou lógica.
- 🔒 Apenas cor, tipografia, ícone, gradiente, sombra, radius e microdetalhes de card.
- 🎯 Nem "tech demais" (glows neon, gradientes ciano-elétricos exagerados dos mockups) nem "clássico demais" (papel creme puro atual). Um verde-sálvia mais vivo, acentos sutis de brilho, superfícies limpas.

---

## Alteração 1 — Paleta de acento (light mode)
**Onde:** `src/index.css` `:root`
- `--accent` sobe de `140 22% 52%` (sage baço) → **`152 45% 48%`** (verde-esmeralda suave, entre o sage atual e o mint dos mockups).
- Novo token `--accent-glow: 152 60% 62%` para halos e gradientes leves (não vira cor de UI dominante).
- `--ring` acompanha o novo accent.
- `--gradient-sacred` reformulado: `linear-gradient(135deg, hsl(152 45% 48%), hsl(160 55% 62%))`.

## Alteração 2 — Paleta de acento (dark mode)
**Onde:** `src/index.css` `.dark`
- `--background` de `30 8% 7%` → **`220 15% 8%`** (carvão levemente azulado — combina com os mockups escuros sem virar preto puro).
- `--card` → `220 12% 11%`.
- `--accent` → **`152 55% 55%`** + `--accent-glow: 160 70% 65%`.
- `--gradient-sacred` dark: `linear-gradient(135deg, hsl(152 55% 45%), hsl(180 60% 55%))` — leve toque ciano só nos gradientes, nunca em texto/ícone puro.

## Alteração 3 — Fundo geral (light)
- `--background` sobe de `38 30% 95%` (creme quente) → **`40 20% 97%`** (off-white mais neutro, como o mockup INÍCIO).
- `--card` mantém contraste sutil: `0 0% 100%` (branco puro) para os cards flutuantes, deixando o fundo respirar.

## Alteração 4 — Tipografia de saudação e títulos de página
**Onde:** `src/pages/Dashboard.tsx` (e páginas com header editorial)
- Manter DM Serif Display, mas destacar palavra-chave em `text-accent` (ex: "Olá, **User!**" — "User!" em verde), replicando o padrão azul-ciano do mockup **sem** o excesso técnico.
- Peso do título mantém-se serif; sem mudanças de tamanho.

## Alteração 5 — VerseOfDayCard
**Onde:** `src/components/VerseOfDayCard.tsx`
- Remover (ou reduzir) a imagem de paisagem introduzida antes → superfície branca sólida com fina borda `border-border/60`, canto `rounded-2xl`.
- Referência "João 3:16" em `font-serif-bible` maior, `text-foreground`.
- Barra de progresso "Versículos Lidos 25/36" com trilha `bg-muted` e preenchimento `bg-accent` + gradiente leve `--gradient-sacred`.
- Sem glow neon; apenas 1 sombra suave `shadow-scripture`.

## Alteração 6 — Cards "Planos em Destaque" / "Acesso Rápido"
**Onde:** `src/components/dashboard/ActivePlansMini.tsx` + tiles do dashboard
- Cards de plano ganham **duas variantes de fundo alternadas**: `bg-accent/10` e `bg-accent/20` (verde-sálvia lavado) mimetizando os quadrados azul/verde do mockup, mas em uma família de cor só (evita o dueto azul-ciano tecnológico).
- Ícone interno em `text-accent`.
- Tiles "Acesso Rápido" (grid 2×2 ou 4×1 conforme atual): fundo `bg-muted/60`, ícone `text-foreground/70`, hover `bg-accent/10`.

## Alteração 7 — BottomNav
**Onde:** `src/components/BottomNav.tsx`
- Manter container flutuante (já existe).
- Item ativo: substituir destaque atual por **pílula fina `bg-accent/15` + label `text-accent`** e uma barrinha superior de 2px `bg-accent` (marcador delicado, sem "glow").
- Item inativo: `text-muted-foreground` como já é. Sem alterar quantidade nem ordem.

## Alteração 8 — Header (`AppHeader.tsx`)
- Sem alterar estrutura (logo + textos).
- Fundo passa a ser `bg-background/85 backdrop-blur-md` com borda inferior `border-border/50` (mais leve que a atual). Sino/ícones (quando existirem) em `text-foreground/70`.

## Alteração 9 — Página Bíblia (`Reading.tsx`)
- Chip da tradução (ex: "NVI") ganha `text-accent` + `border-accent/40 rounded-full`.
- Referência do capítulo em `font-serif-bible` mantém tamanho.
- Botão de áudio (círculo com ícone alto-falante) recebe `bg-accent text-accent-foreground shadow-scripture`.
- FAB de compartilhar (canto inferior direito) migra do verde chapado para **gradiente `--gradient-sacred`** — pequeno toque "tech" contido.

## Alteração 10 — Escritor (WriterEditor)
- Toolbar de formatação mantém-se; ícones ganham `text-foreground/70`, ativos `text-accent`.
- Chips de tag (`#Fé`, `#Estudo`) → `bg-accent/12 text-accent border border-accent/25 rounded-full`.
- Botão **Salvar** ganha `bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-glow))] text-accent-foreground` — único ponto onde o gradiente aparece com destaque.

## Alteração 11 — Explorar
- Tiles grandes (Planos de Leitura, Podcasts, Vídeos, Comunidade) recebem tratamento em **dois tons de accent** (10% e 20%) como no dashboard, mantendo layout.
- Chips de tags (Ansiedade, Gratidão, Liderança) `rounded-full border-border` sem cor sólida.

## Alteração 12 — Perfil
- Avatar em anel `ring-2 ring-accent/40 ring-offset-2 ring-offset-background` (substitui qualquer destaque atual).
- Stat cards (Dias de Leitura / Versículos Lidos): números em `font-serif-bible`, labels em `text-muted-foreground`. Sem mudança de layout.
- Lista de opções (Meus Planos, Anotações, etc.) mantém ícone à esquerda + chevron à direita; ícones em `text-accent`.
- Botão **Sair**: light → `border-destructive/40 text-destructive` outline; dark → mesmo estilo (não texto vermelho vibrante como no mockup escuro; menos agressivo).

## Alteração 13 — Radius e sombras globais
- `--radius` mantém `1.25rem` (já bate com os mockups).
- Padronizar todas sombras de card via `shadow-scripture` (leve) e `shadow-float` (para elementos elevados/flutuantes). Sem mudanças estruturais.

## Alteração 14 — Removidos os "excessos tech"
Para deixar claro o que **não** vou copiar dos mockups:
- ❌ Pontinhos de "partícula" verde/ciano espalhados no fundo.
- ❌ Anéis neon ao redor do avatar (uso apenas `ring/40`, discreto).
- ❌ Botão Salvar em ciano→verde-elétrico saturado (uso gradiente contido em accent).
- ❌ Fundo dark em preto absoluto (uso carvão levemente azulado).

---

## Ordem de execução
1. Tokens em `src/index.css` (Alterações 1–3, 13).
2. Header + BottomNav (8, 7).
3. Dashboard + VerseOfDayCard (4, 5, 6).
4. Reading, Writer, Explorar, Perfil (9–12).
5. `bun run build` + revisão visual em light e dark.

## Fora de escopo
- Nada de novo componente, rota, hook, migração, dep.
- Nada de mudança em tamanho/posição de cards ou botões.
- Nada de novo asset de imagem (paisagens, ilustrações).

Aprovando, entro em build e aplico exatamente nesta ordem.
