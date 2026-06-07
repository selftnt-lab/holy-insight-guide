## Fase 3 — Áudio e leitura assistida

Transforma a tela de leitura num leitor imersivo: narração por voz, acompanhamento visual sincronizado, controles de ritmo e um modo noturno refinado.

---

### 1. Narrador com Web Speech API

**O que o usuário ganha:**
- Botão de play no header da leitura inicia a narração do capítulo inteiro.
- Voz portuguesa selecionada automaticamente (preferindo `pt-BR`, com fallback `pt-PT`/default).
- Seletor de voz no perfil — lista as vozes PT disponíveis no dispositivo.
- Funciona offline e sem chave/API, instantâneo.

**Técnico:**
- Novo hook `useSpeechSynthesis` encapsulando `window.speechSynthesis`, `SpeechSynthesisUtterance`, fila por versículo (1 utterance por verso para permitir highlight sincronizado).
- Provider global `AudioPlayerProvider` (React context) controla estado: `playing`, `currentBook`, `currentChapter`, `currentVerse`, `rate`, `voiceURI`, `queue`.
- Persistência leve em `localStorage` (voz preferida, velocidade).

---

### 2. Auto-scroll sincronizado e highlight do versículo atual

**O que o usuário ganha:**
- Versículo sendo lido ganha destaque sutil (background `accent/10` + borda lateral).
- Página rola suavemente para manter o versículo ativo centralizado.
- Ao terminar o capítulo, oferece "Continuar para o próximo".

**Técnico:**
- Cada `<p data-verse={n}>` em `Reading.tsx` ganha `ref` registrada num map.
- `useEffect` observa `currentVerse` do provider e chama `scrollIntoView({ block: "center", behavior: "smooth" })`.
- `onend` da utterance avança índice; `onerror` para a fila com toast.
- Respeitar `prefers-reduced-motion` (scroll sem animação).

---

### 3. Mini-player persistente

**O que o usuário ganha:**
- Barra flutuante acima do `BottomNav` quando há áudio tocando.
- Mostra "Livro 3 — v.12", play/pause, próximo/anterior versículo, fechar.
- Continua tocando ao navegar para Explore/Perfil; toque na barra volta à leitura no versículo atual.

**Técnico:**
- Novo componente `MiniAudioPlayer.tsx` renderizado dentro do `AppFooter`/raiz do App, lendo do `AudioPlayerProvider`.
- `Link` para `/reading?book=<slug>&chapter=<n>&verse=<v>` — `Reading.tsx` passa a aceitar `?verse=` para abrir já posicionado.
- Esconder quando rota for `/auth`.

---

### 4. Controle de velocidade

**O que o usuário ganha:**
- Popover ao lado do play com presets **0.75x · 1x · 1.25x · 1.5x · 2x**.
- Mudança aplica imediatamente (cancela e retoma utterance no versículo atual com novo `rate`).
- Velocidade salva entre sessões.

**Técnico:**
- `rate` no provider, persistido em `localStorage`.
- Helper `restartFromVerse(n)` reprograma a fila para retomar sem perder posição.

---

### 5. Modo leitura noturna refinado

**O que o usuário ganha:**
- Novo toggle "Modo imersivo" no header da leitura (ícone de lua/sol cheio).
- Aplica: fundo `sepia/dark` dedicado, fonte serif maior (`text-lg → text-xl`), line-height generoso, esconde `BottomNav` e `AppHeader` (overlay sutil que reaparece no tap).
- Preferência salva no perfil (`reading_immersive_mode boolean`).

**Técnico:**
- Tokens novos em `index.css`: `--reading-bg`, `--reading-fg`, `--reading-muted` para light/dark/sepia.
- Classe `data-immersive` no `<main>` da `Reading.tsx` aplica overrides.
- Tap em área neutra alterna visibilidade do chrome (`useState` local).
- Coluna `reading_immersive_mode boolean default false` em `profiles` (migration leve).

---

### Arquivos

```text
src/
  hooks/
    useSpeechSynthesis.ts          (novo)
  contexts/
    AudioPlayerProvider.tsx        (novo — context + estado global)
  components/
    MiniAudioPlayer.tsx            (novo)
    ReadingAudioControls.tsx       (novo — botão play + popover velocidade no header da leitura)
  pages/
    Reading.tsx                    edita: refs por versículo, highlight, scroll, suporte ?verse=, modo imersivo
    Profile.tsx                    edita: seletor de voz PT + toggle modo imersivo persistente
  App.tsx                          edita: envolve em <AudioPlayerProvider>, monta <MiniAudioPlayer />
  index.css                        edita: tokens --reading-* + classes data-immersive
supabase/migrations/
  <timestamp>_reading_immersive_mode.sql   (novo — ALTER TABLE profiles)
```

### Banco

- `ALTER TABLE profiles ADD COLUMN reading_immersive_mode boolean DEFAULT false;`
- `ALTER TABLE profiles ADD COLUMN preferred_voice_uri text;`

Sem novas RLS — `profiles` já tem políticas adequadas.

### Considerações

- Web Speech precisa de gesture do usuário para iniciar — sempre disparado a partir de click no botão de play.
- Algumas vozes PT-BR só existem em iOS/Android nativos; fallback gracioso quando não há voz PT.
- `speechSynthesis` no Safari iOS tem bug com utterances muito longas — por isso enfileiramos por versículo (curtos).
- Em segundo plano (aba inativa), a maioria dos navegadores pausa; aceitamos esse comportamento nesta fase.

### Ordem de entrega

1. Migration (`reading_immersive_mode` + `preferred_voice_uri`).
2. `useSpeechSynthesis` + `AudioPlayerProvider` + integração no `App.tsx`.
3. `ReadingAudioControls` e refs/highlight/scroll na `Reading.tsx`.
4. `MiniAudioPlayer` no rodapé global.
5. Modo imersivo (tokens + toggle + tap-to-hide).
6. Ajustes no Perfil (voz + modo padrão).
