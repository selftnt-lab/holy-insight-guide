# Capacitor — Empacotamento Android / iOS

O projeto já inclui a base do Capacitor. Web continua funcionando normalmente; o Capacitor só entra em ação quando você empacota como app nativo.

## Configuração
- `appId`: `app.lovable.868b953aad314e7a99d277b319621e59`
- `appName`: `RC Bíblia`
- `webDir`: `dist`
- Hot-reload apontando para o preview do Lovable (útil durante desenvolvimento).

## Passo a passo (uma única vez)
1. Exporte o projeto para o seu GitHub e faça `git pull` local.
2. `npm install`
3. `npx cap add ios` e/ou `npx cap add android`
4. `npm run build`
5. `npx cap sync`
6. `npx cap run ios` (macOS + Xcode) ou `npx cap run android` (Android Studio)

## Após cada `git pull`
```bash
npm install
npm run build
npx cap sync
```

## Deep links
As rotas do app já são compatíveis com deep-linking por URL, por exemplo:
- `/reading?book=john&chapter=3&verse=16`
- `/writer/:id`
- `/writer/:id/print`

Para publicar nas lojas, será necessário configurar posteriormente:
- **Android**: intent filter com `android:autoVerify="true"` (App Links).
- **iOS**: `apple-app-site-association` no domínio + Associated Domains no Xcode (Universal Links).

Ambos podem ser adicionados quando o app for de fato submetido — não é necessário para desenvolvimento.

## Blog Lovable
Leia mais em: https://lovable.dev/blog/mobile-development
