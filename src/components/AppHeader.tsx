import { Fragment } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import rcBranchIcon from "@/assets/rc-branch-icon.png.asset.json";
import { Button } from "@/components/ui/button";

const AppHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  if (location.pathname === "/auth") return null;

  return (
    <Fragment>
      <header className="fixed left-0 right-0 top-0 z-50 flex items-center justify-center border-b border-border/60 bg-background/95 px-5 py-2 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <img
            src={rcBranchIcon.url}
            alt=""
            aria-hidden="true"
            className="h-12 w-12 object-contain dark:invert"
          />
          <div className="flex flex-col leading-tight">
            <span className="font-serif text-xl font-semibold tracking-wide text-foreground">
              RC BIBLE
            </span>
            <span className="text-[10px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
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
      <div className="h-[76px] shrink-0" aria-hidden="true" />
    </Fragment>
  );
};

export default AppHeader;
