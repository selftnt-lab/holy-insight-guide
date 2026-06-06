export interface TranslationOption {
  id: string;
  label: string;
  language: "pt" | "en";
}

export const TRANSLATIONS: TranslationOption[] = [
  { id: "almeida", label: "Almeida (PT)", language: "pt" },
  { id: "kjv", label: "King James (EN)", language: "en" },
  { id: "web", label: "World English (EN)", language: "en" },
  { id: "asv", label: "American Standard (EN)", language: "en" },
];

export const getTranslationLabel = (id: string): string =>
  TRANSLATIONS.find((t) => t.id === id)?.label ?? id;
