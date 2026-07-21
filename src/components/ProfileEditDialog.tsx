import { useEffect, useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

interface ProfileData {
  display_name: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  city: string | null;
  birth_date: string | null;
  gender: string | null;
  bible_level: string | null;
  tradition: string | null;
  interests: string[] | null;
  church_name: string | null;
  church_denomination: string | null;
  church_city: string | null;
  church_role: string | null;
  church_years: number | null;
}

const EMPTY: ProfileData = {
  display_name: "",
  full_name: "",
  avatar_url: "",
  bio: "",
  city: "",
  birth_date: "",
  gender: "",
  bible_level: "",
  tradition: "",
  interests: [],
  church_name: "",
  church_denomination: "",
  church_city: "",
  church_role: "",
  church_years: null,
};

const INTEREST_OPTIONS = [
  "Evangelhos",
  "Antigo Testamento",
  "Profecias",
  "Sabedoria",
  "Epístolas",
  "História bíblica",
  "Teologia",
  "Vida devocional",
  "Família",
  "Liderança",
  "Missões",
  "Apologética",
];

const schema = z.object({
  display_name: z.string().trim().min(1, "Nome de exibição obrigatório").max(60),
  full_name: z.string().trim().max(120).optional().or(z.literal("")),
  bio: z.string().trim().max(400).optional().or(z.literal("")),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  church_name: z.string().trim().max(120).optional().or(z.literal("")),
  church_city: z.string().trim().max(80).optional().or(z.literal("")),
  church_role: z.string().trim().max(80).optional().or(z.literal("")),
  church_years: z.number().int().min(0).max(120).nullable().optional(),
});

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  userId: string;
  onSaved?: () => void;
}

const ProfileEditDialog = ({ open, onOpenChange, userId, onSaved }: Props) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [data, setData] = useState<ProfileData>(EMPTY);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open || !userId) return;
    setLoading(true);
    supabase
      .from("profiles")
      .select(
        "display_name, full_name, avatar_url, bio, city, birth_date, gender, bible_level, tradition, interests, church_name, church_denomination, church_city, church_role, church_years"
      )
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data: row }) => {
        if (row) setData({ ...EMPTY, ...row, interests: row.interests ?? [] });
        setLoading(false);
      });
  }, [open, userId]);

  const update = <K extends keyof ProfileData>(key: K, value: ProfileData[K]) =>
    setData((d) => ({ ...d, [key]: value }));

  const toggleInterest = (name: string) => {
    const current = data.interests ?? [];
    const next = current.includes(name)
      ? current.filter((i) => i !== name)
      : [...current, name];
    update("interests", next);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      toast.error("Imagem muito grande (máx 3MB)");
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${userId}/avatar-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, contentType: file.type });
    if (upErr) {
      setUploading(false);
      toast.error("Falha ao enviar imagem");
      return;
    }
    const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
    update("avatar_url", pub.publicUrl);
    setUploading(false);
    toast.success("Foto atualizada");
  };

  const handleSave = async () => {
    try {
      schema.parse({
        display_name: data.display_name ?? "",
        full_name: data.full_name ?? "",
        bio: data.bio ?? "",
        city: data.city ?? "",
        church_name: data.church_name ?? "",
        church_city: data.church_city ?? "",
        church_role: data.church_role ?? "",
        church_years: data.church_years,
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.issues[0].message);
        return;
      }
    }

    setSaving(true);
    const payload = {
      ...data,
      birth_date: data.birth_date || null,
      church_years:
        data.church_years === null || Number.isNaN(data.church_years as number)
          ? null
          : data.church_years,
    };
    const { error } = await supabase
      .from("profiles")
      .update(payload)
      .eq("user_id", userId);
    
    setSaving(false);
    if (error) {
      console.error("Update profile error:", error);
      toast.error("Erro ao salvar. Verifique se você está conectado.");
      return;
    }
    
    // Refresh session to sync user_metadata if possible, though local state is primary
    await supabase.auth.refreshSession();
    
    toast.success("Perfil atualizado");
    onSaved?.();
    onOpenChange(false);
  };

  const initial = (data.display_name || data.full_name || "L").charAt(0).toUpperCase();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar perfil</DialogTitle>
          <DialogDescription>
            Esses dados ajudarão a personalizar sugestões de estudos para você.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-5">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-accent/30">
                  {data.avatar_url ? (
                    <AvatarImage src={data.avatar_url} alt="Avatar" />
                  ) : null}
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                    {initial}
                  </AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-md hover:opacity-90"
                  aria-label="Trocar foto"
                >
                  {uploading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Camera size={16} />
                  )}
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
            </div>

            <Tabs defaultValue="personal">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="personal">Pessoal</TabsTrigger>
                <TabsTrigger value="faith">Fé</TabsTrigger>
                <TabsTrigger value="church">Igreja</TabsTrigger>
              </TabsList>

              {/* PERSONAL */}
              <TabsContent value="personal" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="display_name">Nome de exibição *</Label>
                  <Input
                    id="display_name"
                    value={data.display_name ?? ""}
                    onChange={(e) => update("display_name", e.target.value)}
                    maxLength={60}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nome completo</Label>
                  <Input
                    id="full_name"
                    value={data.full_name ?? ""}
                    onChange={(e) => update("full_name", e.target.value)}
                    maxLength={120}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="birth_date">Nascimento</Label>
                    <Input
                      id="birth_date"
                      type="date"
                      value={data.birth_date ?? ""}
                      onChange={(e) => update("birth_date", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Gênero</Label>
                    <Select
                      value={data.gender ?? ""}
                      onValueChange={(v) => update("gender", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="female">Feminino</SelectItem>
                        <SelectItem value="male">Masculino</SelectItem>
                        <SelectItem value="other">Outro</SelectItem>
                        <SelectItem value="prefer_not">Prefiro não dizer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={data.city ?? ""}
                    onChange={(e) => update("city", e.target.value)}
                    maxLength={80}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Sobre você</Label>
                  <Textarea
                    id="bio"
                    value={data.bio ?? ""}
                    onChange={(e) => update("bio", e.target.value)}
                    maxLength={400}
                    rows={3}
                    placeholder="Conte em poucas palavras sobre sua caminhada..."
                  />
                </div>
              </TabsContent>

              {/* FAITH */}
              <TabsContent value="faith" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Nível de conhecimento bíblico</Label>
                  <Select
                    value={data.bible_level ?? ""}
                    onValueChange={(v) => update("bible_level", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Iniciante</SelectItem>
                      <SelectItem value="intermediate">Intermediário</SelectItem>
                      <SelectItem value="advanced">Avançado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tradição cristã</Label>
                  <Select
                    value={data.tradition ?? ""}
                    onValueChange={(v) => update("tradition", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="evangelical">Evangélica</SelectItem>
                      <SelectItem value="catholic">Católica</SelectItem>
                      <SelectItem value="orthodox">Ortodoxa</SelectItem>
                      <SelectItem value="pentecostal">Pentecostal</SelectItem>
                      <SelectItem value="reformed">Reformada</SelectItem>
                      <SelectItem value="other">Outra</SelectItem>
                      <SelectItem value="none">Nenhuma</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Interesses de estudo</Label>
                  <div className="flex flex-wrap gap-2">
                    {INTEREST_OPTIONS.map((i) => {
                      const active = (data.interests ?? []).includes(i);
                      return (
                        <Badge
                          key={i}
                          variant={active ? "default" : "outline"}
                          className="cursor-pointer select-none"
                          onClick={() => toggleInterest(i)}
                        >
                          {i}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              </TabsContent>

              {/* CHURCH */}
              <TabsContent value="church" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="church_name">Igreja que frequenta</Label>
                  <Input
                    id="church_name"
                    value={data.church_name ?? ""}
                    onChange={(e) => update("church_name", e.target.value)}
                    maxLength={120}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="church_denomination">Denominação</Label>
                    <Input
                      id="church_denomination"
                      value={data.church_denomination ?? ""}
                      onChange={(e) =>
                        update("church_denomination", e.target.value)
                      }
                      placeholder="Ex: Batista"
                      maxLength={80}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="church_city">Cidade</Label>
                    <Input
                      id="church_city"
                      value={data.church_city ?? ""}
                      onChange={(e) => update("church_city", e.target.value)}
                      maxLength={80}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Cargo ou função</Label>
                  <Select
                    value={data.church_role ?? ""}
                    onValueChange={(v) => update("church_role", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Membro</SelectItem>
                      <SelectItem value="visitor">Visitante</SelectItem>
                      <SelectItem value="leader">Líder</SelectItem>
                      <SelectItem value="teacher">Professor(a)</SelectItem>
                      <SelectItem value="deacon">Diácono(a)</SelectItem>
                      <SelectItem value="elder">Presbítero(a)</SelectItem>
                      <SelectItem value="pastor">Pastor(a)</SelectItem>
                      <SelectItem value="missionary">Missionário(a)</SelectItem>
                      <SelectItem value="musician">Músico(a)</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="church_years">Há quantos anos frequenta</Label>
                  <Input
                    id="church_years"
                    type="number"
                    min={0}
                    max={120}
                    value={data.church_years ?? ""}
                    onChange={(e) =>
                      update(
                        "church_years",
                        e.target.value === "" ? null : Number(e.target.value)
                      )
                    }
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving || loading}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileEditDialog;
