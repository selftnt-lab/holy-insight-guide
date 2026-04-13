import { useState, useRef, useEffect } from "react";
import { X, Send, Mic, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
  role: "bot" | "user";
  text: string;
}

const initialMessages: Message[] = [
  {
    role: "bot",
    text: "Olá! 👋 Qual parte deste capítulo você gostaria que eu explicasse de forma mais simples?",
  },
];

const AiChat = ({ onClose }: { onClose: () => void }) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", text: input.trim() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    // Mock bot response
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          role: "bot",
          text: "Ótima pergunta! No contexto original, essa passagem se refere à maneira como os povos antigos entendiam a criação do mundo. Posso explicar mais detalhes se quiser. 😊",
        },
      ]);
    }, 1200);
  };

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 28, stiffness: 300 }}
      className="fixed inset-0 z-50 flex flex-col bg-background"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <Sparkles size={16} />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Tutor IA</p>
            <p className="text-[11px] text-muted-foreground">Sempre disponível</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X size={20} />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-muted text-foreground rounded-bl-md"
              }`}
            >
              {msg.text}
            </div>
          </motion.div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border px-4 py-3 safe-bottom">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground">
            <Mic size={20} />
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Digite sua pergunta..."
            className="rounded-full"
          />
          <Button
            onClick={send}
            size="icon"
            className="shrink-0 rounded-full"
            disabled={!input.trim()}
          >
            <Send size={18} />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default AiChat;
