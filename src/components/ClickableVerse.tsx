import { Fragment } from "react";

interface Props {
  text: string;
  onWordClick: (word: string, index: number) => void;
  /** Retorna o código Strong se a palavra (por índice) já está mapeada. */
  isMapped?: (wordIndex: number, word: string) => string | null;
}

const ClickableVerse = ({ text, onWordClick, isMapped }: Props) => {
  const tokens = text.split(/(\s+|[^\p{L}\p{M}'-]+)/u).filter(Boolean);
  let wordIdx = -1;

  return (
    <>
      {tokens.map((tok, i) => {
        const isWord = /^[\p{L}\p{M}'-]+$/u.test(tok);
        if (!isWord) return <Fragment key={i}>{tok}</Fragment>;
        wordIdx += 1;
        const idx = wordIdx;
        const mapped = isMapped?.(idx, tok) ?? null;
        return (
          <button
            key={i}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onWordClick(tok, idx);
            }}
            title={mapped ? `Estudo disponível · ${mapped}` : undefined}
            className={
              mapped
                ? "rounded px-0.5 underline decoration-accent/60 decoration-dotted underline-offset-4 transition-colors hover:bg-accent/15 hover:text-accent focus:bg-accent/15 focus:text-accent focus:outline-none"
                : "rounded px-0.5 transition-colors hover:bg-accent/15 hover:text-accent focus:bg-accent/15 focus:text-accent focus:outline-none"
            }
          >
            {tok}
          </button>
        );
      })}
    </>
  );
};

export default ClickableVerse;
