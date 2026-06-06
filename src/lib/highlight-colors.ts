export type HighlightColor = "yellow" | "green" | "blue" | "pink";

export const HIGHLIGHT_COLORS: { id: HighlightColor; label: string; bg: string; ring: string }[] = [
  { id: "yellow", label: "Amarelo", bg: "bg-[hsl(48_95%_75%/0.55)] dark:bg-[hsl(48_85%_45%/0.35)]", ring: "ring-[hsl(48_95%_55%)]" },
  { id: "green",  label: "Verde",   bg: "bg-[hsl(140_60%_70%/0.45)] dark:bg-[hsl(140_50%_40%/0.35)]", ring: "ring-[hsl(140_60%_45%)]" },
  { id: "blue",   label: "Azul",    bg: "bg-[hsl(205_85%_75%/0.45)] dark:bg-[hsl(205_75%_45%/0.4)]", ring: "ring-[hsl(205_85%_55%)]" },
  { id: "pink",   label: "Rosa",    bg: "bg-[hsl(335_85%_80%/0.45)] dark:bg-[hsl(335_70%_50%/0.35)]", ring: "ring-[hsl(335_85%_60%)]" },
];

export const getHighlightBg = (color?: string | null): string => {
  if (!color) return "";
  return HIGHLIGHT_COLORS.find((c) => c.id === color)?.bg ?? "";
};
