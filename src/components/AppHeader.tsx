import { useLocation, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import rcBibleLogo from "@/assets/rc-bible-logo.png.asset.json";
import { Button } from "@/components/ui/button";

const AppHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  if (location.pathname === "/auth") return null;

  return (
    <header className="relative flex items-center justify-center border-b border-border/60 px-5 py-1.5">
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
  );
};

export default AppHeader;
