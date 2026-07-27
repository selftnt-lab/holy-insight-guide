# Migração de domínio Lovable → Vercel — status (2026-07-26)

## ✅ RESOLVIDO (2026-07-26, mesma sessão)

`rcbible.app` e `www.rcbible.app` estão servindo a Vercel corretamente. Confirmado via
`curl -I` em ambos: `Server: Vercel`, `200 OK`, sem `/~flock.js` nem referências a
`lovable.app`. E-mail (MX/SPF/DKIM/DMARC do Resend) preservado.

**O que foi feito:**
1. No painel do Lovable (`Domínios do espaço de trabalho` → `rcbible.app` → menu "..." →
   **Desconectar**) — isso removeu o vínculo do domínio com o projeto Lovable e liberou os
   registros `A` travados (`A @ 185.158.133.1` e `A www 185.158.133.1`, que antes só podiam
   ser removidos por essa via — o botão de exclusão direto na tabela de DNS ficava com
   cadeado).
2. Adicionados manualmente os registros apontando pra Vercel:
   - `A` `@` → `216.198.79.1`
   - `A` `www` → `216.198.79.1` (não foi necessário usar CNAME — o valor A funcionou direto)
3. Registros de e-mail (`MX send`, `TXT send` SPF, `TXT resend._domainkey` DKIM, `TXT _dmarc`)
   e o `NS notify` (ns3/ns4.lovable.cloud) **não foram tocados** e continuam funcionando.
4. Os tokens de verificação internos do Lovable (`TXT _lovable`, `_lovable-email`,
   `_lovable.www`) somem automaticamente ao desconectar — sem impacto, eram só verificação
   de propriedade do domínio pro sistema de publish do Lovable.

**Detalhe de diagnóstico durante o processo:** por um instante, depois do "Desconectar",
o domínio ficou sem nenhum registro DNS (`NXDOMAIN`) — resolvido assim que os registros A
novos foram adicionados. TTL é 300s (5 min), então qualquer navegador/DNS local que ainda
mostrar a versão antiga do Lovable deve atualizar sozinho em poucos minutos.

## Contexto histórico (como o problema foi descoberto)

`rcbible.app` e `www.rcbible.app` estavam sendo servidos pelo Lovable, não pela Vercel,
mesmo o projeto Vercel (`rc-bible`, workspace "MAX's projects") já ter os dois domínios
adicionados e marcados como "Production".

## Evidências

1. **Conteúdo servido em `rcbible.app` é do Lovable:**
   - `<script defer src="/~flock.js" data-proxy-url="/~api/analytics">` — script de analytics
     que o Lovable injeta automaticamente em todo app publicado por ele.
   - `og:image` / `twitter:image` apontam para
     `https://pub-....r2.dev/.../id-preview-32dd0f6d--868b953a-ad31-4e7a-99d2-77b319621e59.lovable.app-....png`
     — contém o **ID do projeto Lovable real**: `868b953a-ad31-4e7a-99d2-77b319621e59`.
   - `<link rel="icon" type="image/jpeg" href="/favicon.png">` — bate com o `index.html`
     **antes** das mudanças locais de rebranding (ainda não commitadas neste repo).

2. **DNS não aponta para a Vercel:**
   - Nameservers de `rcbible.app`: `ns1/2/3/4.name.com` (domínio hospedado na **Name.com**).
   - `rcbible.app` resolve para `185.158.133.1` — **não é IP da Vercel**.
   - O deployment real da Vercel resolve para `216.198.79.130` / `64.29.17.130`.
   - A URL direta do deployment (`rc-bible-5sxkxs4si-maxs-projects-5fa40c76.vercel.app`)
     está protegida por Vercel Authentication (SSO) — só acessível logado na Vercel.

3. **Painel do Vercel (`Domains`) mostra "Add Custom Domain" como concluído** — isso só
   reflete a configuração do lado da Vercel (o domínio foi "reivindicado" no projeto),
   **não** significa que o DNS do registrador foi atualizado. São duas etapas distintas.

## Causa raiz encontrada

O projeto Lovable que efetivamente controla `rcbible.app` (ID
`868b953a-ad31-4e7a-99d2-77b319621e59`) é **privado** e pertence a **outra conta/workspace**,
diferente da conta atualmente usada (`novusaisnp@gmail.com`). Ao tentar abrir
`https://lovable.dev/projects/868b953a-ad31-4e7a-99d2-77b319621e59` logado como
`novusaisnp@gmail.com`, o Lovable retorna:

> "You don't have access. This project is private. To view it, contact the owner or
> switch accounts."

A conta `novusaisnp@gmail.com` tem dois workspaces no Lovable (`NOVUS's Lovable` e
`kiwepo1496's Lovable`) e **nenhum dos dois contém o projeto RC Bible** — só projetos
de ERP (`novusaierp-*`, `Novus Fiscal Hub`, etc).

Também não há login ativo na **Name.com** (registrador do domínio) neste navegador —
provavelmente foi o Lovable que registrou/conectou o domínio originalmente, então a
conta na Name.com pode ter sido criada automaticamente e nunca usada diretamente pelo
usuário atual.

## Cuidado: não perder os registros de e-mail (Resend)

O domínio já tem DNS configurado e **verificado** para envio de e-mail via **Resend**
(visto em `resend.com/domains/...`):

| Tipo | Nome                    | Conteúdo (resumo)              | Status   |
|------|--------------------------|---------------------------------|----------|
| TXT  | `resend._domainkey`     | DKIM (`p=MIGfMA0GCSqG...`)      | Verified |
| MX   | `send`                  | `feedback-smtp.[...].amazonses.com` (prio 10) | Verified |
| TXT  | `send`                  | SPF (`v=spf1 include=[...] ~all`) | Verified |

**Qualquer mudança de DNS precisa preservar esses três registros**, senão o envio de
e-mail transacional (auth, notificações) quebra.

## Próximos passos possíveis

1. **Pedir acesso ao projeto Lovable original** (`868b953a-ad31-4e7a-99d2-77b319621e59`) —
   via botão "Request access" no Lovable, ou contatando diretamente quem criou o projeto
   originalmente (freelancer/agência/versão anterior da equipe).
2. **Ou recuperar a conta Name.com** — tentar "Forgot Username or Password" em name.com
   usando `novusaisnp@gmail.com`. Se o Lovable registrou o domínio com esse e-mail, dá pra
   recuperar acesso direto ao DNS.
3. Uma vez com acesso ao DNS (via Lovable ou direto na Name.com), atualizar os registros do
   domínio para apontar para a Vercel, **mantendo os registros do Resend intactos**:
   - `A` (raiz, `rcbible.app`) → `76.76.21.21`
   - `CNAME` (`www.rcbible.app`) → `cname.vercel-dns.com`
   - (a Vercel mostra os valores exatos e atualizados em Project → Domains → Edit de cada
     domínio — essa tela ficou instável na automação do navegador na sessão em que isso foi
     investigado; vale conferir lá antes de aplicar)
4. Depois de propagar o DNS, revalidar: `curl -sI https://rcbible.app` deve responder com
   headers de Vercel (`x-vercel-id`, sem `/~flock.js` no HTML) em vez dos indícios do Lovable.

## Estado dos commits locais (contexto relacionado)

Havia trabalho de rebranding de ícones/logo não commitado no working tree nesta mesma
sessão (troca de `*.asset.json` do Lovable por PNGs reais, novo `vercel.json` com rewrite
de SPA, `BrandLogo.tsx` simplificado). Ver histórico do chat / `git status` para retomar.
