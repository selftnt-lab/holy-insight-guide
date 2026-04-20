import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Moon, Sun, BookOpen, Flame, LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { fetchProgress } from "@/lib/reading-progress";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Profile = () => {
  const { theme, toggle } = useTheme();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [chaptersRead, setChaptersRead] = useState(0);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("display_name")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setDisplayName(data?.display_name || user.email?.split("@")[0] || "Leitor");
      });
    fetchProgress(user.id).then((p) => setChaptersRead(p.chaptersRead.length));
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Até logo!");
    navigate("/auth", { replace: true });
  };

  const initial = (displayName || "L").charAt(0).toUpperCase();

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
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
              {initial}
            </AvatarFallback>
          </Avatar>
          <h1 className="mt-4 text-xl font-bold text-foreground">{displayName}</h1>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-8 grid grid-cols-2 gap-3"
        >
          {stats.map(({ icon: Icon, label, value }) => (
            <Card key={label} className="rounded-xl p-4 text-center">
              <Icon size={20} className="mx-auto text-accent" />
              <p className="mt-2 text-lg font-bold text-foreground">{value}</p>
              <p className="text-[11px] text-muted-foreground">{label}</p>
            </Card>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
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
      </div>
    </div>
  );
};

export default Profile;
