## Objetivo

Repaginar o Holy Insight Guide para (1) ter cara de aplicativo de estudo bíblico — não um app genérico — e (2) incorporar a identidade visual da NOVUS.AI (logo + paleta), além de adicionar o crédito "Um produto" + logo NOVUS.AI no rodapé de todos os ambientes.

---

## 1. Identidade visual NOVUS.AI

**Paleta extraída do logo:**
- Azul-marinho profundo `NOVUS` → cor primária (substitui o atual primary azul-acinzentado)
- Ciano elétrico do ícone → cor de destaque/accent (substitui o dourado atual)
- Off-white pergaminho → mantém o fundo "bíblico" no tema claro
- Cinza-azulado escuro → fundo do tema escuro

**Tokens em `src/index.css`** (HSL):
- `--primary`: azul-marinho NOVUS (~`215 75% 18%`)
- `--accent`: ciano NOVUS (~`190 85% 55%`)
- `--background` claro: off-white pergaminho atual (mantém aspecto bíblico)
- `--background` escuro: azul-noite (~`220 30% 10%`)
- Novos tokens de gradiente/sombra: `--gradient-sacred`, `--gradient-novus`, `--shadow-scripture`

Aplicar nos dois modos (claro e escuro) preservando contraste WCAG.

---

## 2. Aparência "estudo bíblico"

Reforçar o caráter editorial/escritural sem virar um app genérico SaaS:

- **Tipografia**: continuar com `Lora` (serifa) para versículos e títulos de seções devocionais; `Inter` para UI. Adicionar uso intencional de Lora em headings de Dashboard/Reading/Explore (hoje quase tudo é Inter).
- **Texturas e ornamentos sutis**:
  - Pequeno divisor ornamental (linha + cruz/folha estilizada SVG) entre seções principais.
  - Capitular (drop cap) opcional no início de capítulos em `Reading`.
  - Numeração de versículo em estilo "marginalia" mais refinado (já existe `ClickableVerse` — apenas refinar peso/cor).
- **Cards e superfícies**: bordas mais suaves com leve textura "papel" via gradiente quase imperceptível em `--card`.
- **Hero do Dashboard**: novo cabeçalho com saudação + versículo do dia em destaque tipográfico (Lora grande, citação com aspas decorativas), usando o azul-marinho NOVUS como banner com fio ciano.
- **BottomNav**: ícones existentes mantidos, mas com estado ativo usando o ciano NOVUS sobre fundo azul-marinho semitransparente (em vez do dourado).

Sem reescrever páginas — apenas refinar tokens, headings e adicionar 1 componente de divisor ornamental reutilizável.

---

## 3. Logo NOVUS.AI no app

- Copiar `user-uploads://NOVUS_AI.PNG` para `src/assets/novus-ai-logo.png` (logo completa horizontal).
- Gerar/recortar versão somente-ícone para usos compactos? **→ ver pergunta abaixo**. Por padrão, usar a logo horizontal completa no rodapé.
- Importar como ES6 nos componentes que precisarem.

---

## 4. Rodapé global "Um produto NOVUS.AI"

Novo componente `src/components/AppFooter.tsx`:
- Texto "Um produto" + `<img>` da logo NOVUS.AI inline (altura ~14–16px), centralizado.
- Renderizado em **todas as rotas autenticadas**, posicionado **acima do `BottomNav`** (com `mb` suficiente para não colidir).
- Oculto em `/auth` (mesma regra do `BottomNav`).
- Em telas com scroll (Dashboard, Reading, Explore, Profile, ChatHistory), aparece ao final do conteúdo, não fixo — para não competir com a `BottomNav`. **→ ver pergunta abaixo sobre fixo vs. inline.**

Integração: montar `<AppFooter />` em `App.tsx` ao lado do `BottomNav`, ou adicionar dentro do container de cada página. Preferência: montar uma vez em `App.tsx` para garantir presença em todos os ambientes sem editar cada página.

---

## Arquivos a criar/editar

**Criar:**
- `src/assets/novus-ai-logo.png` (cópia do upload)
- `src/components/AppFooter.tsx`
- `src/components/SacredDivider.tsx` (divisor ornamental reutilizável, opcional mas recomendado)

**Editar:**
- `src/index.css` — nova paleta (primary/accent + background dark) + tokens de gradiente/sombra
- `tailwind.config.ts` — apenas se precisar registrar novos tokens nominais (a maioria já vem via CSS vars)
- `src/App.tsx` — montar `<AppFooter />`
- `src/components/BottomNav.tsx` — ajustes mínimos de cor de estado ativo (já usa `text-primary`, então herda automaticamente; conferir contraste)
- `src/pages/Dashboard.tsx` — aplicar Lora em heading principal + usar `SacredDivider`
- `src/pages/Reading.tsx` — refinar heading + drop cap opcional
- (Demais páginas herdam via tokens, sem edições estruturais)

## Fora de escopo

- Reescrita de páginas ou mudança de fluxo de navegação.
- Alteração da lógica do Tutor IA, histórico, leitura ou autenticação.
- Tema de alto contraste / acessibilidade adicional além do já existente.

---

## Perguntas antes de implementar

(em seguida via `ask_questions`)
