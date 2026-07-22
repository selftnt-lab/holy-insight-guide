import { Fragment } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const AppHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { needsConfirmation, loading: authLoading } = useAuth();
  
  if (location.pathname === "/auth" || needsConfirmation || authLoading) return null;

  return (
    <Fragment>
      <header className="fixed left-0 right-0 top-0 z-[100] flex items-center justify-center border-b border-border bg-background px-5 py-3 shadow-md">
        <div className="flex flex-col items-center">
          <BrandLogo size="md" className="z-10" />
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
