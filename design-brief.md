# Brief de design — RC Bible (redesenho visual)

Documento de contexto para retomar o trabalho de redesenho visual do app **RC Bible**, projeto da **Renovada Church** com tecnologia da **Novus.AI**. Repositório: `holy-insight-guide` (Vite + React + TypeScript + Tailwind + shadcn/ui + Supabase + Capacitor).

## Problema de partida

O app já tinha toda a funcionalidade construída (leitura, planos, tutor IA, léxico Strong, escritor de sermões/esboços, reflexões, destaques), mas o visual estava genérico — cara de "app gerado por IA" (blur circles, `rounded-3xl` uniforme em tudo, cards com sombra flutuante, `motion.div` em cascata). Público-alvo vai do leitor iniciante (só lê na igreja) até pastores/professores criando esboços — o visual não pode ser minimalista demais (afasta iniciante) nem poluído (afasta estudioso). A meta é uma superfície visual rica que convide à curiosidade, com profundidade que aparece em camadas ao toque, não tudo exposto de uma vez.

## Direção visual (v2 — a aprovada)

Inspiração conceitual: manuscritos iluminados — capitulares ilustradas, texto como protagonista, ornamento com função. Fundo com temperatura de papel, não branco/preto puro. Sem gradientes, sem blur, sem sombra flutuante genérica.

### Paleta — modo claro
- Fundo: `#FAF6EC` (papel quente)
- Texto primário: `#241F14`
- Texto secundário/muted: `#8A7A52`
- Bordas: `#E3D9BF`
- Verde (ação, progresso, identidade Renovada): `#0F6E56`
- Verde claro de fundo (destaque sutil): `#EFF5EC`
- Dourado/âmbar (uso único: referência bíblica): `#BA7517`

### Paleta — modo escuro
- Fundo: `#16130D` (quase preto, quente — não cinza-azulado)
- Fundo mais escuro (bordas de frame): `#0A0906`
- Texto primário: `#EDE6D0`
- Texto secundário/muted: `#8F866A`
- Bordas: `#3A3424`
- Verde (mais vibrante para contraste): `#3FBF97`
- Verde escuro de fundo: `#1B2620`
- Dourado/âmbar: `#D9A653`

### Regra de cor (vale nos dois modos)
- **Âmbar/dourado = sempre e só referência bíblica** (ex.: "SALMOS 139:1"). Nunca decoração.
- **Verde = sempre ação/estado/identidade da Renovada** (progresso, botão primário, aba ativa).
- **Ciano = sempre e só conteúdo gerado por IA** (Tutor IA, resumos, sugestões) — é a cor da Novus.AI, usada como código funcional, não como logotipo espalhado.

### Tipografia
Mantida do projeto atual — não precisa trocar fontes:
- Serifada `DM Serif Display` (var `--font-voice` / classe `.font-serif-bible`): títulos, saudações, texto de escritura, capitulares.
- Sans `Fira Sans`: UI, corpo de texto de interface, labels.

### O motivo "portal iluminado" (peça central do sistema)
Cartões que representam um momento de aprofundamento (versículo do dia, resposta do tutor IA) **invertem de cor em relação ao fundo**:
- No modo claro, o cartão é escuro (`#241F14`) com texto claro (`#F5EFDC`) — um "recorte" de página iluminada dentro do dia.
- No modo escuro, o mesmo cartão **vira claro** (`#F5EFDC` com texto `#241F14`) — a mesma página, agora "acesa" dentro da noite, como uma vela.
- Sempre inclui: selo pequeno de referência em dourado, capitular SVG (ver abaixo), e (quando aplicável) chips indicando o que tem por trás ("Hebraico", "Comentário", "Contexto") — a profundidade é anunciada, não escondida.

### Capitulares ilustradas
Primeira letra do trecho de escritura desenhada como SVG (não só `font-size` grande) — pode incluir um traço orgânico fino ao fundo (ver motivo de marca da Renovada abaixo). Usada no card do versículo do dia, no topo da tela de Leitura, e potencialmente na tela de splash/onboarding.

### Princípios de layout gerais
- Cantos retos por padrão (`border-radius: 0`); a única exceção decorativa é o frame de dispositivo em mockups.
- Divisórias de 1px (`border: 1px solid var(--border)`) em vez de `box-shadow` / cards flutuantes.
- Um único botão de alto contraste (verde sólido) por tela para a ação primária — não competir com múltiplos botões arredondados.
- Nada de `motion.div` com fade-in em cascata cobrindo a tela inteira — a riqueza vem da ilustração/tipografia, não da animação de entrada.
- Marcação de versículo em destaque (highlight) usa régua/borda lateral em dourado, não fundo colorido tipo marca-texto.

## Marcas parceiras (como aparecem no app)

### Renovada Church — identidade visual do produto (não é "logo colado")
Marca própria: padrão radial de galhos/raízes que se bifurcam (referência: `Melhorar_qualidade_gráfica_da_imagem.png`, enviada pelo usuário). No app, esse motivo:
- Vira a família de ornamentos do sistema — fundo do splash/onboarding, textura atrás de capitulares, divisores especiais.
- Muda de cor por contexto/modo, mas mantém a estrutura: ~10 galhos saindo de um ponto central, cada um com pelo menos uma bifurcação (garfo em Y) no meio do trajeto, não só na ponta. Traço espesso, arredondado (`stroke-linecap: round`), levemente espiralado.
- Cor: verde `#0F6E56` no modo claro, dourado `#D9A653` no modo escuro.
- **Pendência**: a última versão (SVG com 10 galhos + bifurcação intermediária) foi validada como estruturalmente mais fiel, mas ainda pode não estar perfeita — vale revisar lado a lado com a imagem original antes de finalizar como asset de produção.

### Novus.AI — cor funcional, não chrome de marca
Marca própria: ícone de circuito formando um "N" (linhas retas + diagonal + pequenos nós/vias circulares nas junções e pontas — referência: logo `NOVUS.AI` enviada pelo usuário). No app:
- Aparece **exclusivamente** em conteúdo/UI gerado ou processado por IA (Tutor IA, resumos, sugestões inteligentes) — nunca como marca ambiente.
- Reconstrução do ícone: 2 traços verticais + 1 diagonal conectando, com 4 nós principais (círculos vazados) nas junções/pontas + 2 pequenos nós extra ("stubs") saindo perpendicularmente, como no logo original.
- Cor: ciano escuro `#0E7A8C` no modo claro (contraste sobre fundo `#EAF6F8`), ciano claro `#4FD8EC` no modo escuro (contraste sobre fundo `#10201F`) — a cor precisa mudar de tom entre os modos pra manter legibilidade, não é a mesma cor invertida.

### Onde os logos completos (lockup formal) aparecem
Só em um lugar: uma tela "Sobre" dentro de Perfil, com o crédito por extenso "Uma parceria Renovada Church × Novus.AI" e os dois logos oficiais lado a lado. No resto do app, cada marca se manifesta como sistema visual/cor funcional, não como logotipo.

### Rodapé (substituindo o `BottomNav` atual)
Uma linha de texto simples, sem logos: `RC Bible · Renovada Church · tecnologia Novus.AI` — mesmo peso tipográfico para os dois nomes.

## Notas por tela (mockups já validados na conversa, usar como referência visual — não como spec pixel-perfect)

- **Dashboard**: saudação grande em serifada, card "portal" do versículo do dia com capitular + chips de profundidade, grid 2x2 de métricas (progresso / tutor IA em destaque verde-claro), botão único "Continuar leitura".
- **Reading**: header minimalista com navegação de capítulo, capitular SVG no início do trecho, numeração de versículo pequena/muted, destaque de versículo com régua lateral dourada (não fundo), toolbar inferior com ícones (grifar, anotar, áudio, comparar tradução, modo imersivo).
- **Explore**: abas retas "Perguntar" / "Palavra", lista de sugestões com ícone (não cards soltos), resultado de estudo de palavra em card "portal", campo de busca de palavra no rodapé.
- **Search**: campo de busca com régua inferior, contagem de resultados, lista de versículos com referência em dourado + trecho, histórico de buscas recentes.
- **Plans**: card do plano ativo em destaque (borda verde), barra de progresso fina, lista de outros planos com tag de tipo em dourado, botão "criar plano personalizado" no rodapé.
- **Profile**: identidade com avatar quadrado (não círculo) + nível em dourado, abas "Perfil"/"Destaques", lista de configurações em linhas com régua (não cards), ação destrutiva (excluir conta) em vermelho discreto.
- **Journal (Reflexões)**: lista tipo diário — referência em dourado + data, trecho da reflexão em serifada, sem cards, só réguas entre entradas.
- **Writer**: lista de documentos com filtros (livro/capítulo/status), cada item com referência bíblica em dourado; editor com título grande serifado sobre régua verde, conteúdo em serifada, tags como chips discretos.

## O que NÃO fazer (aprendido ao longo da conversa)
- Não usar blur circles / halos decorativos (`blur-2xl` + `bg-accent/10`) — é o clichê mais repetido em apps gerados por IA hoje.
- Não usar `rounded-3xl` uniforme em tudo.
- Não deixar minimalista/clean demais (réguas finas + muito branco) — isso resolve só metade do problema e vira outro clichê (estética "Notion/Linear/agente de código"), além de privilegiar só quem já sabe o que quer, afastando o leitor iniciante.
- Não usar o dourado pra nada que não seja referência bíblica, nem o ciano pra nada que não seja conteúdo de IA — a cor perde função se virar decoração genérica.
