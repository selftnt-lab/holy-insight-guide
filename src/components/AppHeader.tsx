import { Fragment } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import rcBibleLogo from "@/assets/rc-bible-logo.png.asset.json";
import { Button } from "@/components/ui/button";

const AppHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  if (location.pathname === "/auth") return null;

  return (
    <Fragment>
      <header className="fixed left-0 right-0 top-0 z-50 flex items-center justify-center border-b border-border/60 bg-background/95 px-5 py-1.5 backdrop-blur-sm">
        <img
          src={rcBibleLogo.url}
          alt="RC Bible - Renovada Church"
          className="h-24 w-auto object-scale-down"
        />
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
      <div className="h-[108px] shrink-0" aria-hidden="true" />
    </Fragment>
  );
};

export default AppHeader;
