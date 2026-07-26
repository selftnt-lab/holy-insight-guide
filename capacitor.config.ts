import type { CapacitorConfig } from '@capacitor/cli';

/**
 * DEV vs PROD:
 * - Em desenvolvimento (CAP_ENV=dev), habilita hot-reload apontando para o preview do Lovable.
 * - Em produção (default), NÃO define `server.url` — o app carrega o bundle empacotado em `dist/`.
 */
const isDev = process.env.CAP_ENV === "dev";

const config: CapacitorConfig = {
  appId: 'ai.novus.rcbiblia',
  appName: 'RC Bíblia',
  webDir: 'dist',
  ...(isDev
    ? {
        server: {
          url: "https://868b953a-ad31-4e7a-99d2-77b319621e59.lovableproject.com?forceHideBadge=true",
          cleartext: true,
        },
      }
    : {}),
};

export default config;