import { Fragment } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const AppHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { needsConfirmation } = useAuth();
  
  if (location.pathname === "/auth" || needsConfirmation) return null;

  return (
    <Fragment>
      <header className="fixed left-0 right-0 top-0 z-50 flex items-center justify-center border-b border-border/50 bg-background/85 px-5 py-3 backdrop-blur-md">
        <div className="flex flex-col items-center">
          <img
            src={rcLogo.url}
            className="h-16 w-auto object-contain transition-all duration-700 hover:scale-105 mix-blend-multiply dark:mix-blend-screen dark:invert brightness-[1.1] contrast-[1.1] dark:brightness-[1.5] dark:contrast-[1.2] drop-shadow-[0_4px_12px_rgba(0,0,0,0.15)] dark:drop-shadow-[0_0_15px_rgba(255,255,255,0.25)]"
            style={{ 
              transitionProperty: "filter, transform, opacity, brightness, contrast",
              transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)"
            }}
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/search")}
          className="absolute right-3 top-1/2 -translate-y-1/2"
          aria-label="Buscar"
        >
          <Search size={20} />
        </Button>
      </header>
      <div className="h-[96px] shrink-0" aria-hidden="true" />

    </Fragment>
  );
};

export default AppHeader;
