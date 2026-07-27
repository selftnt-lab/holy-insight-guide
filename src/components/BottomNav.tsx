import { Home, Compass, User, PenLine, BookOpen, Heart } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import novusLogo from "@/assets/novus-ai-logo.png";
import { useAuth } from "@/hooks/useAuth";

const tabs = [
  { path: "/", icon: Home, label: "Início" },
  { path: "/reading", icon: BookOpen, label: "Bíblia" },
  { path: "/contribute", icon: Heart, label: "Contribuir" },
  { path: "/writer", icon: PenLine, label: "Escritor" },
  { path: "/explore", icon: Compass, label: "Explorar" },
  { path: "/profile", icon: User, label: "Perfil" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { needsConfirmation } = useAuth();

  if (location.pathname === "/auth" || needsConfirmation) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 safe-bottom">
      <div className="pointer-events-auto mx-auto mb-3 max-w-lg px-4">
        <div className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-float backdrop-blur-xl">
          <nav className="flex items-center justify-around px-2 py-2">
            {tabs.map((tab) => {
              const active = location.pathname === tab.path;
              return (
                <button
                  key={tab.path}
                  onClick={() => navigate(tab.path)}
                  aria-label={tab.label}
                  className={cn(
                    "relative flex min-w-[54px] flex-col items-center gap-1 px-2 py-1.5 transition-colors",
                    active ? "text-accent" : "text-muted-foreground"
                  )}
                >
                  {active && (
                    <span
                      aria-hidden
                      className="absolute left-1/2 top-0 h-[2px] w-8 -translate-x-1/2 rounded-full bg-accent"
                    />
                  )}
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full transition-all",
                      active && "bg-accent/15"
                    )}
                  >
                    <tab.icon size={20} strokeWidth={active ? 2.4 : 1.8} />
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-medium leading-none",
                      active ? "text-accent" : "text-muted-foreground"
                    )}
                  >
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </nav>
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 border-t border-border/50 px-3 py-2 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span>Um produto</span>
              <img
                src={novusLogo}
                alt="NOVUS.AI"
                className="h-3 w-auto opacity-90 transition-opacity hover:opacity-100 dark:brightness-110 dark:contrast-125"
              />
            </span>
            <span aria-hidden className="opacity-50">·</span>
            <Link to="/legal/termos" className="hover:text-foreground">Termos</Link>
            <span aria-hidden className="opacity-50">·</span>
            <Link to="/legal/privacidade" className="hover:text-foreground">Privacidade</Link>
            <span aria-hidden className="opacity-50">·</span>
            <Link to="/legal/licencas" className="hover:text-foreground">Licenças</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BottomNav;
