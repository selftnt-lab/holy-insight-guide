import { Fragment } from "react";

interface Props {
  text: string;
  onWordClick: (word: string, index: number) => void;
}

// Tokeniza o versículo separando palavras de pontuação/espaços.
// Mantemos um índice por palavra (ignorando tokens de pontuação).
const ClickableVerse = ({ text, onWordClick }: Props) => {
  // Captura sequências de letras (incluindo acentos) como palavras
  const tokens = text.split(/(\s+|[^\p{L}\p{M}'-]+)/u).filter(Boolean);
  let wordIdx = -1;

  return (
    <>
      {tokens.map((tok, i) => {
        const isWord = /^[\p{L}\p{M}'-]+$/u.test(tok);
        if (!isWord) return <Fragment key={i}>{tok}</Fragment>;
        wordIdx += 1;
        const idx = wordIdx;
        return (
          <button
            key={i}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onWordClick(tok, idx);
            }}
            className="rounded px-0.5 transition-colors hover:bg-accent/15 hover:text-accent focus:bg-accent/15 focus:text-accent focus:outline-none"
          >
            {tok}
          </button>
        );
      })}
    </>
  );
};

export default ClickableVerse;
