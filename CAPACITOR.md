# Capacitor — Empacotamento Android / iOS

O projeto inclui a base do Capacitor. Web continua funcionando normalmente; o Capacitor entra em ação quando você empacota como app nativo.

## Configuração

- `appId`: `app.lovable.868b953aad314e7a99d277b319621e59`
- `appName`: `RC Bíblia`
- `webDir`: `dist`

## DEV vs PROD

`capacitor.config.ts` alterna via variável `CAP_ENV`:

- **DEV** (`CAP_ENV=dev`) → habilita `server.url` apontando para o preview do Lovable com hot-reload e `cleartext: true`.
- **PROD** (default) → **nenhum** `server.url` é definido. O app roda o bundle empacotado em `dist/`.

```bash
# Desenvolvimento (hot-reload contra o preview do Lovable)
CAP_ENV=dev npx cap sync

# Produção (bundle local)
bun run build
npx cap sync
```

## Passo a passo (uma vez)

1. Exporte o projeto para o seu GitHub e faça `git pull` local.
2. `npm install`
3. `npx cap add ios` e/ou `npx cap add android`
4. `bun run build`
5. `npx cap sync`
6. `npx cap run ios` (macOS + Xcode) ou `npx cap run android` (Android Studio)

## Após cada `git pull`

```bash
npm install
bun run build
npx cap sync
```

## Ícones e Splash

O logo canônico está em `public/manifest.webmanifest` (asset CDN de 512×512).

Gere os ícones/splash nativos com o utilitário oficial `@capacitor/assets` no ambiente local:

```bash
npm i -D @capacitor/assets
mkdir -p resources
# coloque em resources/:
#   - icon-only.png (1024×1024)
#   - icon-foreground.png (1024×1024, com transparência)
#   - icon-background.png (1024×1024, sólido)
#   - splash.png (2732×2732)
#   - splash-dark.png (2732×2732, opcional)
npx @capacitor/assets generate --iconBackgroundColor "#FAFAF5" --iconBackgroundColorDark "#0B0B0F" --splashBackgroundColor "#FAFAF5" --splashBackgroundColorDark "#0B0B0F"
```

Isso preenche `android/app/src/main/res/*` e `ios/App/App/Assets.xcassets/*` automaticamente.

## Checklist de release

1. `bun run test` — suíte Vitest verde.
2. `bun run lint` — sem erros.
3. `bun run build` — gera `dist/` sem warnings críticos.
4. `npx cap sync` (sem `CAP_ENV=dev`).
5. Abrir Xcode / Android Studio e:
   - subir `versionCode` / `versionName` (Android) ou `CFBundleVersion` / `CFBundleShortVersionString` (iOS).
   - gerar build de release (AAB para Play Store, Archive para App Store).
6. Testar em dispositivo físico o fluxo: login → leitura → escrever → imprimir → chat IA.
7. Ver `RELEASE_CHECKLIST.md` para requisitos de loja.

## Deep links

As rotas do app já são compatíveis com deep-link:

- `/reading?book=john&chapter=3&verse=16`
- `/writer/:id`
- `/writer/:id/print`

Para publicar nas lojas será necessário depois:

- **Android**: intent filter com `android:autoVerify="true"` (App Links).
- **iOS**: `apple-app-site-association` no domínio + Associated Domains no Xcode (Universal Links).

## Blog Lovable

Leia mais em: https://lovable.dev/blog/mobile-development

## Service Workers

O app **não registra Service Worker** — nem no build web, nem no empacotamento Capacitor.
Isso garante que o app nativo carregue **sempre** o bundle empacotado em `dist/` e não uma versão web em cache. Se algum dia adicionarmos SW, ele deve ser guardado por `Capacitor.isNativePlatform()` para nunca rodar dentro do app nativo.
