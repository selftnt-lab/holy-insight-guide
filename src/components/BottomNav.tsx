import { Home, BookOpen, Compass, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import novusLogo from "@/assets/novus-ai-logo.png";

const tabs = [
  { path: "/", icon: Home, label: "Início" },
  { path: "/reading", icon: BookOpen, label: "Leitura" },
  { path: "/explore", icon: Compass, label: "Explorar" },
  { path: "/profile", icon: User, label: "Perfil" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  if (location.pathname === "/auth") return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/80 backdrop-blur-xl safe-bottom">
      <div className="mx-auto flex max-w-lg items-center justify-around py-2">
        {tabs.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={cn(
                "flex flex-col items-center gap-0.5 px-4 py-1.5 transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          );
        })}
      </div>
      <div className="flex items-center justify-center gap-2 py-1 text-[10px] text-muted-foreground">
        <span>Um produto</span>
        <img
          src={novusLogo}
          alt="NOVUS.AI"
          className="h-3.5 w-auto opacity-90 dark:brightness-0 dark:invert"
        />
      </div>
    </nav>
  );
};

export default BottomNav;
