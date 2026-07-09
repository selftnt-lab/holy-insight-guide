import { Home, BookOpen, Compass, User, PenLine } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import novusLogo from "@/assets/novus-ai-logo.png";

const tabs = [
  { path: "/", icon: Home, label: "Início" },
  { path: "/reading", icon: BookOpen, label: "Leitura" },
  { path: "/writer", icon: PenLine, label: "Escritor" },
  { path: "/explore", icon: Compass, label: "Explorar" },
  { path: "/profile", icon: User, label: "Perfil" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  if (location.pathname === "/auth") return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/90 backdrop-blur-xl safe-bottom">
      <div className="mx-auto flex max-w-lg items-center justify-around py-2">
        {tabs.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2.5 py-1.5 transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 border-t border-border/50 px-3 py-1 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span>Um produto</span>
          <img
            src={novusLogo}
            alt="NOVUS.AI"
            className="h-3 w-auto opacity-90 dark:brightness-0 dark:invert"
          />
        </span>
        <span aria-hidden className="opacity-50">·</span>
        <Link to="/legal/termos" className="hover:text-foreground">Termos</Link>
        <span aria-hidden className="opacity-50">·</span>
        <Link to="/legal/privacidade" className="hover:text-foreground">Privacidade</Link>
        <span aria-hidden className="opacity-50">·</span>
        <Link to="/legal/licencas" className="hover:text-foreground">Licenças</Link>
      </div>
    </nav>
  );
};

export default BottomNav;
