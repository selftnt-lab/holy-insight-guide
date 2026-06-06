import { useLocation, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import novusInsightLogo from "@/assets/novus-insight-logo.png";
import { Button } from "@/components/ui/button";

const AppHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  if (location.pathname === "/auth") return null;

  return (
    <header className="relative flex items-center justify-center px-5 py-3">
      <img
        src={novusInsightLogo}
        alt="NOVUS Insight - Estudo Bíblico"
        className="h-20 w-auto object-scale-down"
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
