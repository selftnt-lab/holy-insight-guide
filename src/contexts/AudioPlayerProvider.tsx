import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, ReactNode } from "react";
import { useBibleChapter } from "@/hooks/useBibleChapter";
import { DEFAULT_TRANSLATION } from "@/lib/bible-translations";
import { debugCodepoints } from "@/lib/sanitize-bible-text";

interface PlayingTarget {
  bookSlug: string;
  bookName: string;
  chapter: number;
  translation: string;
}

interface AudioPlayerState {
  target: PlayingTarget | null;
  playing: boolean;
  paused: boolean;
  currentVerse: number | null;
  rate: number;
  voiceURI: string | null;
  voices: SpeechSynthesisVoice[];
  play: (target: PlayingTarget, startVerse?: number) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  next: () => void;
  prev: () => void;
  setRate: (r: number) => void;
  setVoiceURI: (v: string | null) => void;
}

const AudioPlayerContext = createContext<AudioPlayerState | null>(null);

const STORAGE_RATE = "audio.rate";
const STORAGE_VOICE = "audio.voiceURI";

const supported = typeof window !== "undefined" && "speechSynthesis" in window;

export const AudioPlayerProvider = ({ children }: { children: ReactNode }) => {
  const [target, setTarget] = useState<PlayingTarget | null>(null);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [currentVerse, setCurrentVerse] = useState<number | null>(null);
  const [rate, setRateState] = useState<number>(() => {
    const v = Number(localStorage.getItem(STORAGE_RATE));
    return v > 0 ? v : 1;
  });
  const [voiceURI, setVoiceURIState] = useState<string | null>(
    () => localStorage.getItem(STORAGE_VOICE)
  );
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Load chapter for current target — translation MUST be part of the key so
  // that switching versions reloads the correct text (fixes stale TTS bug).
  const { data: chapterData } = useBibleChapter(
    target?.bookSlug ?? "",
    target?.chapter ?? 0,
    target?.translation ?? DEFAULT_TRANSLATION,
  );

  const versesRef = useRef<{ verse: number; text: string }[]>([]);
  useEffect(() => {
    versesRef.current = chapterData?.verses ?? [];
  }, [chapterData]);

  // Load available voices
  useEffect(() => {
    if (!supported) return;
    const update = () => {
      const list = window.speechSynthesis.getVoices();
      setVoices(list);
    };
    update();
    window.speechSynthesis.onvoiceschanged = update;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const resolveVoice = useCallback((): SpeechSynthesisVoice | null => {
    if (!voices.length) return null;
    if (voiceURI) {
      const found = voices.find((v) => v.voiceURI === voiceURI);
      if (found) return found;
    }
    return (
      voices.find((v) => v.lang?.toLowerCase().startsWith("pt-br")) ||
      voices.find((v) => v.lang?.toLowerCase().startsWith("pt")) ||
      voices[0] ||
      null
    );
  }, [voices, voiceURI]);

  const stoppingRef = useRef(false);
  const queueIndexRef = useRef(0);

  const stop = useCallback(() => {
    stoppingRef.current = true;
    if (supported) window.speechSynthesis.cancel();
    setPlaying(false);
    setPaused(false);
    setCurrentVerse(null);
  }, []);

  const speakAt = useCallback(
    (index: number) => {
      if (!supported) return;
      const verses = versesRef.current;
      if (index < 0 || index >= verses.length) {
        stop();
        return;
      }
      stoppingRef.current = false;
      queueIndexRef.current = index;
      const v = verses[index];
      setCurrentVerse(v.verse);
      // (C) pre-TTS — must match exactly what the UI renders.
      debugCodepoints(`pre-TTS verse ${v.verse}`, v.text);
      const utter = new SpeechSynthesisUtterance(v.text);
      const voice = resolveVoice();
      if (voice) {
        utter.voice = voice;
        utter.lang = voice.lang;
      } else {
        utter.lang = "pt-BR";
      }
      utter.rate = rate;
      utter.onend = () => {
        if (stoppingRef.current) return;
        const nextIdx = queueIndexRef.current + 1;
        if (nextIdx < versesRef.current.length) {
          speakAt(nextIdx);
        } else {
          setPlaying(false);
          setPaused(false);
          setCurrentVerse(null);
        }
      };
      utter.onerror = () => {
        if (stoppingRef.current) return;
        setPlaying(false);
        setPaused(false);
      };
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
      setPlaying(true);
      setPaused(false);
    },
    [rate, resolveVoice, stop]
  );

  // Wait for chapter to load then start
  const pendingStartRef = useRef<number | null>(null);
  useEffect(() => {
    if (pendingStartRef.current !== null && versesRef.current.length > 0) {
      const verse = pendingStartRef.current;
      pendingStartRef.current = null;
      const idx = Math.max(
        0,
        versesRef.current.findIndex((v) => v.verse === verse)
      );
      speakAt(idx === -1 ? 0 : idx);
    }
  }, [chapterData, speakAt]);

  const play = useCallback(
    (t: PlayingTarget, startVerse = 1) => {
      stop();
      setTarget(t);
      // If same chapter+translation already loaded, start immediately
      if (
        chapterData &&
        target?.bookSlug === t.bookSlug &&
        target?.chapter === t.chapter &&
        target?.translation === t.translation
      ) {
        const idx = Math.max(
          0,
          versesRef.current.findIndex((v) => v.verse === startVerse)
        );
        speakAt(idx === -1 ? 0 : idx);
      } else {
        // Chapter/translation changing — wait for new verses to load, then start.
        // Clear cached verses so speakAt can't fire against stale text.
        versesRef.current = [];
        pendingStartRef.current = startVerse;
      }
    },
    [chapterData, speakAt, stop, target]
  );

  const pause = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.pause();
    setPaused(true);
  }, []);

  const resume = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.resume();
    setPaused(false);
  }, []);

  const next = useCallback(() => {
    speakAt(queueIndexRef.current + 1);
  }, [speakAt]);

  const prev = useCallback(() => {
    speakAt(Math.max(0, queueIndexRef.current - 1));
  }, [speakAt]);

  const setRate = useCallback(
    (r: number) => {
      setRateState(r);
      localStorage.setItem(STORAGE_RATE, String(r));
      if (playing) {
        // restart current verse with new rate
        const idx = queueIndexRef.current;
        setTimeout(() => speakAt(idx), 50);
      }
    },
    [playing, speakAt]
  );

  const setVoiceURI = useCallback((v: string | null) => {
    setVoiceURIState(v);
    if (v) localStorage.setItem(STORAGE_VOICE, v);
    else localStorage.removeItem(STORAGE_VOICE);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (supported) window.speechSynthesis.cancel();
    };
  }, []);

  const value = useMemo<AudioPlayerState>(
    () => ({
      target,
      playing,
      paused,
      currentVerse,
      rate,
      voiceURI,
      voices,
      play,
      pause,
      resume,
      stop,
      next,
      prev,
      setRate,
      setVoiceURI,
    }),
    [target, playing, paused, currentVerse, rate, voiceURI, voices, play, pause, resume, stop, next, prev, setRate, setVoiceURI]
  );

  return (
    <AudioPlayerContext.Provider value={value}>
      {children}
    </AudioPlayerContext.Provider>
  );
};

export const useAudioPlayer = () => {
  const ctx = useContext(AudioPlayerContext);
  if (!ctx) throw new Error("useAudioPlayer must be used inside AudioPlayerProvider");
  return ctx;
};
