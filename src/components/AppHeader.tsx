import { Fragment } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import rcLogo from "@/assets/rc-bible-logo-new.png.asset.json";
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
            alt="RC Bible"
            className="h-14 w-auto object-contain dark:invert"
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
