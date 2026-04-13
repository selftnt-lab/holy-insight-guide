import { useState } from "react";
import { Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import AiChat from "@/components/AiChat";

interface WordDef {
  word: string;
  meaning: string;
  context: string;
}

const dictionary: Record<string, WordDef> = {
  Gênesis: {
    word: "Gênesis",
    meaning: "Do grego 'génesis' — origem, nascimento. É o livro das origens.",
    context: "No hebraico, o livro é chamado 'Bereshit' (בְּרֵאשִׁית), que significa 'No princípio'.",
  },
  Espírito: {
    word: "Espírito de Deus",
    meaning: "Em hebraico: 'Ruach Elohim' — sopro ou vento de Deus.",
    context: "Representa a presença ativa e criadora de Deus movendo-se sobre as águas primordiais.",
  },
  trevas: {
    word: "Trevas",
    meaning: "Ausência de luz; no contexto bíblico, representa o caos antes da criação.",
    context: "As trevas no Antigo Oriente simbolizavam desordem e o desconhecido.",
  },
  abismo: {
    word: "Abismo (Tehom)",
    meaning: "Águas primordiais profundas. Em hebraico: 'Tehom'.",
    context: "Referência às águas caóticas que existiam antes da criação ordenada por Deus.",
  },
};

const verses = [
  { num: 1, text: ["No princípio, Deus criou os céus e a terra."] },
  {
    num: 2,
    text: [
      "A terra era sem forma e vazia; ",
      { word: "trevas", display: "trevas" },
      " cobriam a face do ",
      { word: "abismo", display: "abismo" },
      ", e o ",
      { word: "Espírito", display: "Espírito" },
      " de Deus pairava sobre as águas.",
    ],
  },
  { num: 3, text: ["Disse Deus: \"Haja luz\"; e houve luz."] },
  { num: 4, text: ["Deus viu que a luz era boa; e separou a luz das trevas."] },
  { num: 5, text: ["Deus chamou à luz Dia, e às trevas chamou Noite. Houve tarde e manhã — o primeiro dia."] },
];

const Reading = () => {
  const [selectedWord, setSelectedWord] = useState<WordDef | null>(null);
  const [showChat, setShowChat] = useState(false);

  return (
    <div className="min-h-screen pb-28">
      <div className="mx-auto max-w-lg px-5 pt-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">
            Gênesis · Capítulo 1
          </p>
          <h1 className="mt-1 font-serif text-2xl font-bold text-foreground">
            A Criação
          </h1>
        </motion.div>

        {/* Verses */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-5"
        >
          {verses.map((verse) => (
            <p key={verse.num} className="font-serif text-lg leading-relaxed text-foreground/90">
              <sup className="mr-1 text-xs font-sans font-bold text-accent">
                {verse.num}
              </sup>
              {verse.text.map((part, i) => {
                if (typeof part === "string") return <span key={i}>{part}</span>;
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedWord(dictionary[part.word])}
                    className="border-b border-dashed border-accent/50 text-primary font-medium transition-colors hover:border-accent"
                  >
                    {part.display}
                  </button>
                );
              })}
            </p>
          ))}
        </motion.div>
      </div>

      {/* FAB */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: "spring" }}
        onClick={() => setShowChat(true)}
        className="fixed bottom-24 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg shadow-accent/30 transition-transform active:scale-95"
      >
        <Sparkles size={24} />
      </motion.button>

      {/* Dictionary Drawer */}
      <Drawer open={!!selectedWord} onOpenChange={(o) => !o && setSelectedWord(null)}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="text-lg">{selectedWord?.word}</DrawerTitle>
            <DrawerDescription className="mt-2 text-base leading-relaxed">
              {selectedWord?.meaning}
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-8">
            <div className="rounded-xl bg-muted p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Contexto Cultural
              </p>
              <p className="mt-2 text-sm leading-relaxed text-foreground">
                {selectedWord?.context}
              </p>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {/* AI Chat Overlay */}
      <AnimatePresence>
        {showChat && <AiChat onClose={() => setShowChat(false)} />}
      </AnimatePresence>
    </div>
  );
};

export default Reading;
