import { Fragment } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import rcBranchIcon from "@/assets/rc-branch-icon.png.asset.json";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const AppHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { needsConfirmation } = useAuth();
  
  if (location.pathname === "/auth" || needsConfirmation) return null;

  return (
    <Fragment>
      <header className="fixed left-0 right-0 top-0 z-50 flex items-center justify-center border-b border-border/50 bg-background/85 px-5 py-2 backdrop-blur-md">
        <div className="flex flex-col items-center gap-1">
          <img
            src={rcBranchIcon.url}
            alt=""
            aria-hidden="true"
            className="h-10 w-10 object-contain dark:invert"
          />
          <div className="flex flex-col items-center leading-tight">
            <span className="font-serif text-base font-semibold tracking-wide text-foreground">
              RC BIBLE
            </span>
            <span className="text-[9px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
              Renovada Church
            </span>
          </div>
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
