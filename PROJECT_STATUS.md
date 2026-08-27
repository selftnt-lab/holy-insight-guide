# RC Bible — Status do projeto (última atualização: 2026-07-26)

Documento de retomada de contexto. Se você é um chat/sessão novo (Claude, VSCode, etc.)
começando do zero neste repositório, leia isto primeiro.

## O que é o projeto

App de Bíblia (leitura, estudo com IA, planos de leitura, devocional, escritor de
sermões/anotações) da Renovada Church. Stack: React + Vite + TypeScript, Supabase
(backend/auth/DB/edge functions), Capacitor (app nativo Android/iOS), deploy na Vercel.

- Frontend: `src/` (App Router-like via `src/routes`, páginas em `src/pages`)
- Backend: Supabase — `supabase/functions` (edge functions: chat IA, TTS, lookup de
  Strong's, auth email hook, etc.), `supabase/migrations`, `supabase/tests` (pgTAP)
- App nativo: `android/` via Capacitor
- IA: Google Gemini (migrado da Anthropic/Claude em 2026-08-27 — chave `GOOGLE_AI_API_KEY`
  nos secrets do Supabase; `ANTHROPIC_API_KEY` removida)

## Contas e onde cada coisa mora (mapa de identidades)

Isso é o que mais causa confusão em sessões novas — **leia com atenção**:

| Conta / e-mail | Onde é usada |
|---|---|
| `novusaisnp@gmail.com` | Dono da conta **Vercel** (workspace "MAX's projects", plano Hobby). Também tem 2 workspaces no Lovable (`NOVUS's Lovable`, `kiwepo1496's Lovable`) — **nenhum dos dois** tem o projeto RC Bible. |
| `selftnt@gmail.com` (aparece como usuário "Max Roger" no Lovable) | Dono do **projeto Lovable original** (`868b953a-ad31-4e7a-99d2-77b319621e59`, privado) e da organização **GitHub `selftnt-lab`**, onde vive o repositório real: `selftnt-lab/holy-insight-guide`. Também tem conta no **Resend** (e-mail transacional) e no domínio `rcbible.app` (comprado/gerenciado via Name.com, com o Lovable como "authoritative DNS provider"). |
| `Maxe <mrassessoriaeconsultorias@gmail.com>` | Identidade **Git local** desta máquina (`git config user.name/email`). É quem autora os commits deste working tree. |

Working tree local (`C:\Users\Lignum Biomassa\rc-bible`) → remote `origin` →
`https://github.com/selftnt-lab/holy-insight-guide.git` (branch `main`, sem outros
branches remotos).

## O que foi resolvido na sessão de 2026-07-26 (ver `DOMAIN_MIGRATION.md` para detalhes)

1. **Domínio `rcbible.app` / `www.rcbible.app`** — estava servido pelo Lovable (hospedagem
   própria), não pela Vercel, mesmo a Vercel já "tendo" o domínio configurado no projeto.
   Causa: DNS (gerenciado dentro do Lovable, nameservers Name.com) apontava pro IP do
   Lovable. Corrigido: desconectado o domínio do Lovable, registros `A` trocados pro IP da
   Vercel (`216.198.79.1`), e-mail (MX/SPF/DKIM/DMARC do Resend) preservado.
2. **Projeto Vercel apontava pro repositório GitHub errado** (`novusaisnp/novusaisnp` em
   vez de `selftnt-lab/holy-insight-guide`) — por isso nenhum push aparecia lá. Reconectado
   ao repo certo em Vercel → Settings → Git.
3. **Plano Hobby da Vercel bloqueava deploy** por autoria do commit (`Maxe
   <mrassessoriaeconsultorias@gmail.com>` não é reconhecido como colaborador da conta
   `novusaisnp`, e Hobby não permite colaboração em repo privado). Corrigido tornando
   `selftnt-lab/holy-insight-guide` **público** no GitHub.
4. Lovable (`gpt-engineer-app[bot]`) ainda estava sincronizado com esse mesmo repositório
   GitHub e reverteu automaticamente o rebranding no meio do processo — desconectado o Git
   dentro do Lovable (Project → Settings → Git) pra isso não repetir.
5. Rebranding (logo/ícones novos, `vercel.json`, simplificação do `BrandLogo.tsx`) que
   estava só no working tree local foi commitado e está em produção.

**Estado atual confirmado**: `rcbible.app` e `www.rcbible.app` servem a build correta da
Vercel (logo nova, sem `/~flock.js` do Lovable), e-mail transacional intacto, deploy
automático funcionando a cada push em `main`.

## Pendências conhecidas (não resolvidas nesta sessão)

- **`RELEASE_CHECKLIST.md`** — checklist pra publicar nas lojas (Play Store / App Store):
  testes, lint, versionamento, ícones, páginas legais, Data Safety forms, etc. Ainda não
  percorrido.
- **`.lovable/plan.md`** — plano de refatoração visual (paleta de cor, tipografia) separado
  do rebranding de logo/ícones feito agora. Não confirmado se já foi aplicado.
- Erros de lint pré-existentes (37 no total, `npm run lint`) em arquivos não relacionados
  a esta sessão (`useWordStudy.ts`, `Explore.tsx`, funções Supabase, `tailwind.config.ts`)
  — não bloqueiam build, mas valem limpeza futura.
- Repositório GitHub agora é **público** (era privado) — decisão tomada pra destravar o
  deploy sem custo. Se em algum momento quiserem torná-lo privado de novo, será preciso
  reativar o plano Pro da Vercel (ou resolver a identidade do commit author de outra forma)
  pra não travar deploys de novo.

## Outros documentos no repositório

- `DOMAIN_MIGRATION.md` — histórico técnico completo da investigação/resolução de domínio
  e deploy (a mesma sessão que gerou este arquivo).
- `AGENTS.md` — regras pra qualquer PR gerado por agente (lint/test/build obrigatórios).
- `RELEASE_CHECKLIST.md` — checklist de publicação nas lojas.
- `CAPACITOR.md`, `COMO_GERAR_APK.md` — build do app nativo Android.
