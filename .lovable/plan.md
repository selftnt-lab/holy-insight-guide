## Objetivo
Permitir que o usuário troque a versão bíblica no topo da tela de leitura, com várias traduções em português além da Almeida atual.

## Fonte dos textos
A API pública **bolls.life** (grátis, sem chave) oferece as principais traduções em português. Vou embarcar:

- **ACF** — Almeida Corrigida Fiel
- **ARC** — Almeida Revista e Corrigida (atual "almeida" do app)
- **ARA** — Almeida Revista e Atualizada
- **NAA** — Nova Almeida Atualizada
- **NVI-PT** — Nova Versão Internacional
- **NTLH** — Nova Tradução na Linguagem de Hoje

A Almeida clássica atual (via bible-api.com) continua como fallback caso o bolls.life falhe.

## O que vai mudar

**1. Edge function `bible`**
- Aceitar parâmetro `translation` com os novos códigos acima
- Buscar em bolls.life quando for uma versão nova; manter bible-api.com para o legado "almeida"/KJV/WEB
- Mapear slug do livro para o `bookid` numérico (1-66) exigido pelo bolls
- Cachear cada `(versão, livro, capítulo)` na tabela `bible_chapter_cache` (já existe e já tem essa chave composta — nada a migrar)

**2. Hook `useBibleChapter`**
- Aceitar `translation` como argumento
- Passar no query string da chamada

**3. Preferência do usuário**
- Persistir a versão escolhida no `localStorage` (chave `bible_translation`)
- Default: `arc` (equivalente da Almeida atual)

**4. Página de leitura (`Reading.tsx`)**
- Adicionar um Select shadcn no topo da área de leitura, ao lado do título do capítulo
- Trocar a versão atualiza o hook e recarrega o capítulo

## Detalhes técnicos

- Formato bolls.life: `GET https://bolls.life/get-chapter/{code}/{bookid}/{chapter}/` → `[{ pk, verse, text }]`
- Sanitizar `<S>...</S>` (tags Strong opcionais no retorno)
- Timeout 15s + 1 retry (mesmo padrão do fetch atual)
- Reference formatada localmente: `{BookName} {chapter}`

## Fora de escopo
- Persistir a versão no perfil do backend (só localStorage por enquanto)
- Comparação lado-a-lado entre versões (o `TranslationComparison.tsx` existente permanece intocado)
- Áudio por versão (mantém o comportamento atual)
