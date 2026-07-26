export interface BibleTranslation {
  code: string;      // sent to the edge function
  label: string;     // short label in UI
  full: string;      // long name
}

export const BIBLE_TRANSLATIONS: BibleTranslation[] = [
  { code: "arc",   label: "ARC",   full: "Almeida Revista e Corrigida" },
  { code: "acf",   label: "ACF",   full: "Almeida Corrigida Fiel" },
  { code: "ara",   label: "ARA",   full: "Almeida Revista e Atualizada" },
  { code: "naa",   label: "NAA",   full: "Nova Almeida Atualizada" },
  { code: "nvi",   label: "NVI",   full: "Nova Versão Internacional" },
  { code: "ntlh",  label: "NTLH",  full: "Nova Tradução na Linguagem de Hoje" },
  { code: "nvt",   label: "NVT",   full: "Nova Versão Transformadora" },
  { code: "kja",   label: "KJA",   full: "King James Atualizada" },
];

export const DEFAULT_TRANSLATION = "arc";
const STORAGE_KEY = "bible_translation";

export const getStoredTranslation = (): string => {
  if (typeof window === "undefined") return DEFAULT_TRANSLATION;
  const v = window.localStorage.getItem(STORAGE_KEY);
  if (v && BIBLE_TRANSLATIONS.some((t) => t.code === v)) return v;
  return DEFAULT_TRANSLATION;
};

export const setStoredTranslation = (code: string) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, code);
};
