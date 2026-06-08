import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const CreatePlanDialog = ({ open, onClose, onCreated }: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [topic, setTopic] = useState("");
  const [days, setDays] = useState("14");
  const [level, setLevel] = useState("intermediário");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!user || !topic.trim()) return;
    setBusy(true);
    try {
      const { data: gen, error: fnErr } = await supabase.functions.invoke("generate-plan", {
        body: { topic: topic.trim(), days: Number(days), level },
      });
      if (fnErr) throw fnErr;
      if (gen?.error) throw new Error(gen.error);
      if (!gen?.title || !Array.isArray(gen?.days)) throw new Error("Resposta inválida da IA");

      const { error: insErr } = await supabase.from("reading_plans").insert({
        slug: `${slugify(topic)}-${Date.now().toString(36)}`,
        name: gen.title,
        description: gen.description ?? `Plano sobre ${topic}`,
        duration_days: gen.days.length,
        category: "tematico",
        books_filter: "all",
        ai_generated: true,
        created_by: user.id,
        custom_days: gen.days,
      });
      if (insErr) throw insErr;

      toast({ title: "Plano criado", description: gen.title });
      setTopic("");
      onCreated();
      onClose();
    } catch (e) {
      toast({
        title: "Erro ao criar plano",
        description: e instanceof Error ? e.message : "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !busy && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles size={16} className="text-accent" />
            Plano personalizado por IA
          </DialogTitle>
          <DialogDescription>
            Descreva um tema e a duração — a IA monta um plano com leituras e reflexões.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label htmlFor="topic">Tema</Label>
            <Input
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ex.: ansiedade, graça, liderança…"
              disabled={busy}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Duração</Label>
            <RadioGroup value={days} onValueChange={setDays} className="mt-2 grid grid-cols-4 gap-2">
              {["7", "14", "21", "30"].map((d) => (
                <label
                  key={d}
                  className={`flex cursor-pointer items-center justify-center rounded-lg border px-3 py-2 text-sm transition-colors ${
                    days === d ? "border-accent bg-accent/10 text-accent" : "hover:bg-muted"
                  }`}
                >
                  <RadioGroupItem value={d} className="sr-only" />
                  {d} dias
                </label>
              ))}
            </RadioGroup>
          </div>

          <div>
            <Label>Nível</Label>
            <RadioGroup value={level} onValueChange={setLevel} className="mt-2 grid grid-cols-3 gap-2">
              {["iniciante", "intermediário", "avançado"].map((l) => (
                <label
                  key={l}
                  className={`flex cursor-pointer items-center justify-center rounded-lg border px-2 py-2 text-xs capitalize transition-colors ${
                    level === l ? "border-accent bg-accent/10 text-accent" : "hover:bg-muted"
                  }`}
                >
                  <RadioGroupItem value={l} className="sr-only" />
                  {l}
                </label>
              ))}
            </RadioGroup>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={busy || !topic.trim()}>
            {busy ? (
              <>
                <Loader2 size={14} className="mr-1 animate-spin" /> Gerando…
              </>
            ) : (
              <>
                <Sparkles size={14} className="mr-1" /> Criar plano
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePlanDialog;
