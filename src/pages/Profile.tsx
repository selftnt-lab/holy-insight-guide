import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Moon, Sun, BookOpen, Flame, LogOut, Pencil, Church, MessageSquare, Highlighter, Volume2, NotebookText } from "lucide-react";
import { useAudioPlayer } from "@/contexts/AudioPlayerProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { fetchProgress } from "@/lib/reading-progress";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import ProfileEditDialog from "@/components/ProfileEditDialog";
import HighlightsList from "@/components/HighlightsList";
import { resolveFirstName } from "@/lib/user-name";


interface ProfileRow {
  display_name: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  city: string | null;
  bible_level: string | null;
  tradition: string | null;
  interests: string[] | null;
  church_name: string | null;
  church_denomination: string | null;
  church_role: string | null;
}

const ROLE_LABEL: Record<string, string> = {
  member: "Membro",
  visitor: "Visitante",
  leader: "Líder",
  teacher: "Professor(a)",
  deacon: "Diácono(a)",
  elder: "Presbítero(a)",
  pastor: "Pastor(a)",
  missionary: "Missionário(a)",
  musician: "Músico(a)",
  other: "Outro",
};

const LEVEL_LABEL: Record<string, string> = {
  beginner: "Iniciante",
  intermediate: "Intermediário",
  advanced: "Avançado",
};

const Profile = () => {
  const { theme, toggle } = useTheme();
  const { voices, voiceURI, setVoiceURI } = useAudioPlayer();
  const ptVoices = voices.filter((v) => v.lang?.toLowerCase().startsWith("pt"));
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [chaptersRead, setChaptersRead] = useState(0);
  const [editOpen, setEditOpen] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select(
        "display_name, full_name, avatar_url, bio, city, bible_level, tradition, interests, church_name, church_denomination, church_role"
      )
      .eq("user_id", user.id)
      .maybeSingle();
    setProfile(data ?? null);
    const p = await fetchProgress(user.id);
    setChaptersRead(p.chaptersRead.length);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Até logo!");
    navigate("/auth", { replace: true });
  };

  const meta = (user?.user_metadata ?? {}) as {
    picture?: string;
    avatar_url?: string;
  };
  const displayName = resolveFirstName(user, profile, "Leitor");
  const initial = displayName.charAt(0).toUpperCase();
  const avatarUrl = profile?.avatar_url || meta.picture || meta.avatar_url;

  const stats = [
    { icon: Flame, label: "Sequência", value: "—" },
    { icon: BookOpen, label: "Capítulos", value: String(chaptersRead) },
  ];

  return (
    <div className="min-h-screen pb-24">
      <div className="mx-auto max-w-lg px-5 pt-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center"
        >
          <Avatar className="h-20 w-20 border-4 border-accent/30">
            {avatarUrl ? <AvatarImage src={avatarUrl} alt={displayName} /> : null}
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
              {initial}
            </AvatarFallback>
          </Avatar>
          <h1 className="mt-4 text-xl font-bold text-foreground">{displayName}</h1>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          {profile?.city && (
            <p className="text-xs text-muted-foreground mt-0.5">{profile.city}</p>
          )}

          <Button
            variant="outline"
            size="sm"
            className="mt-4 rounded-full"
            onClick={() => setEditOpen(true)}
          >
            <Pencil size={14} className="mr-2" />
            Editar perfil
          </Button>
        </motion.div>

        {profile?.bio && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mt-5 text-center text-sm text-foreground/80"
          >
            {profile.bio}
          </motion.p>
        )}

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-6 grid grid-cols-2 gap-3"
        >
          {stats.map(({ icon: Icon, label, value }) => (
            <Card key={label} className="rounded-xl p-4 text-center">
              <Icon size={20} className="mx-auto text-accent" />
              <p className="mt-2 text-lg font-bold text-foreground">{value}</p>
              <p className="text-[11px] text-muted-foreground">{label}</p>
            </Card>
          ))}
        </motion.div>

        {/* Tabs: perfil / destaques */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="mt-6"
        >
          <Tabs defaultValue="profile">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">Perfil</TabsTrigger>
              <TabsTrigger value="highlights">
                <Highlighter size={14} className="mr-1" /> Destaques
              </TabsTrigger>
            </TabsList>
            <TabsContent value="highlights" className="mt-4">
              <HighlightsList />
            </TabsContent>
            <TabsContent value="profile" className="mt-4 space-y-6">

        {profile?.interests && profile.interests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6"
          >
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Interesses
            </h2>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((i) => (
                <Badge key={i} variant="secondary">
                  {i}
                </Badge>
              ))}
            </div>
            {profile.bible_level && (
              <p className="mt-3 text-xs text-muted-foreground">
                Nível: {LEVEL_LABEL[profile.bible_level] ?? profile.bible_level}
              </p>
            )}
          </motion.div>
        )}

        {/* Church */}
        {(profile?.church_name || profile?.church_role) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-6"
          >
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Igreja
            </h2>
            <Card className="rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Church size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  {profile.church_name && (
                    <p className="font-semibold text-foreground truncate">
                      {profile.church_name}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {[
                      profile.church_denomination,
                      profile.church_role && ROLE_LABEL[profile.church_role],
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Settings */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Configurações
          </h2>
          <Card className="rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {theme === "dark" ? <Moon size={18} /> : <Sun size={18} />}
                <span className="text-sm font-medium text-foreground">Modo escuro</span>
              </div>
              <Switch checked={theme === "dark"} onCheckedChange={toggle} />
            </div>
          </Card>

          {ptVoices.length > 0 && (
            <Card className="mt-3 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Volume2 size={18} className="mt-0.5" />
                <div className="flex-1">
                  <label className="text-sm font-medium text-foreground">
                    Voz da narração
                  </label>
                  <select
                    value={voiceURI ?? ""}
                    onChange={(e) => setVoiceURI(e.target.value || null)}
                    className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Automática (português)</option>
                    {ptVoices.map((v) => (
                      <option key={v.voiceURI} value={v.voiceURI}>
                        {v.name} ({v.lang})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>
          )}
        </motion.div>



        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32 }}
          className="mt-3 space-y-2"
        >
          <Button
            variant="outline"
            className="w-full rounded-xl justify-start"
            onClick={() => navigate("/chat-history")}
          >
            <MessageSquare size={18} className="mr-2" />
            Histórico do Tutor IA
          </Button>
          <Button
            variant="outline"
            className="w-full rounded-xl justify-start"
            onClick={() => navigate("/journal")}
          >
            <NotebookText size={18} className="mr-2" />
            Meu diário de reflexões
          </Button>
        </motion.div>


        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mt-6"
        >
          <Button
            variant="outline"
            className="w-full rounded-xl"
            onClick={handleSignOut}
          >
            <LogOut size={18} className="mr-2" />
            Sair
          </Button>
        </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>


      {user && (
        <ProfileEditDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          userId={user.id}
          onSaved={load}
        />
      )}
    </div>
  );
};

export default Profile;
