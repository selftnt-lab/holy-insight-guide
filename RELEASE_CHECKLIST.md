# Release Checklist — RC Bíblia

Checklist objetivo para publicar nas lojas. Não é jurídico — é o mínimo operacional.

## 1. Pré-build

- [ ] `bun run test` verde
- [ ] `bun run lint` sem erros
- [ ] `bun run build` sem warnings críticos
- [ ] `npx cap sync` executado (sem `CAP_ENV=dev`)
- [ ] Versão bumpada em Android (`versionCode` + `versionName`) e iOS (`CFBundleVersion` + `CFBundleShortVersionString`)

## 2. Manifest / Ícones / Splash

- [ ] `public/manifest.webmanifest` com `name`, `short_name`, `theme_color`, `background_color` corretos
- [ ] Ícones 192 / 512 + maskable presentes
- [ ] `resources/icon-only.png` (1024×1024) e `resources/splash.png` (2732×2732) gerados via `@capacitor/assets`

## 3. Links internos (obrigatório dentro do app)

- [ ] Termos de Uso acessível em `/legal/termos`
- [ ] Política de Privacidade em `/legal/privacidade`
- [ ] Licenças (traduções bíblicas e libs) em `/legal/licencas`
- [ ] "Excluir minha conta" acessível a partir do perfil (LGPD + requisito Google Play)

## 4. Google Play — Data Safety

Declarar no formulário:

- [ ] **Autenticação**: e-mail e senha (via provedor de backend)
- [ ] **Conteúdo gerado pelo usuário**: sermões, devocionais, notas, destaques, reflexões — armazenados na conta do usuário
- [ ] **Uso de IA**: envio de prompts do usuário a provedores de IA (LLM + TTS) para geração de respostas/áudio
- [ ] **Analytics** (se habilitado): declarar provedor
- [ ] **Criptografia em trânsito**: sim (HTTPS)
- [ ] **Exclusão de dados**: sim, in-app + endpoint
- [ ] Content rating: Teen (conteúdo religioso/bíblico)

## 5. Apple — App Privacy

Mesma matriz do Google Play, no formato App Store Connect:

- [ ] Contact Info: e-mail (auth)
- [ ] User Content: documentos do Escritor, destaques, notas, reflexões
- [ ] Identifiers: user ID
- [ ] Usage Data: se analytics estiver on
- [ ] Data linked to user: sim (auth-scoped)
- [ ] Data used for tracking: **não** (não usamos cross-app tracking)

## 6. Direitos autorais das traduções bíblicas

- [ ] `/legal/licencas` lista cada tradução usada e sua fonte (KJV/ACF em domínio público; ARA/NVI/NAA/NVT/NTLH/KJA sob licença via API externa)
- [ ] Metadata das versões disponíveis reflete corretamente restrições (ex: somente leitura online, sem cache local para versões licenciadas)

## 7. Descrição de loja

- [ ] Título: "RC Bíblia — Leitura, Estudo e Devocional"
- [ ] Descrição curta (<80 chars)
- [ ] Screenshots: leitura, escritor, chat IA, plano de leitura, dark mode
- [ ] Ícone 512×512 (Play) / 1024×1024 (App Store)
- [ ] Feature graphic 1024×500 (Play)

## 8. Pós-submit

- [ ] Configurar deep links (App Links Android + Universal Links iOS) apontando para o domínio publicado
- [ ] Monitorar crashes na primeira semana
- [ ] Preparar rota de suporte (`suporte@…`) visível na página da loja
