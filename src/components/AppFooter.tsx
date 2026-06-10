import { Link, useLocation } from "react-router-dom";
import novusLogo from "@/assets/novus-ai-logo.png";

const AppFooter = () => {
  const location = useLocation();
  if (location.pathname === "/auth") return null;

  return (
    <footer className="fixed bottom-14 left-0 right-0 z-40 flex flex-col items-center gap-1 bg-background/80 py-1.5 text-[11px] text-muted-foreground backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <span>Um produto</span>
        <img
          src={novusLogo}
          alt="NOVUS.AI"
          className="h-4 w-auto opacity-90 dark:brightness-0 dark:invert"
        />
      </div>
      <nav className="flex items-center gap-3 text-[10px]">
        <Link to="/legal/termos" className="hover:text-foreground">Termos</Link>
        <span aria-hidden>·</span>
        <Link to="/legal/privacidade" className="hover:text-foreground">Privacidade</Link>
        <span aria-hidden>·</span>
        <Link to="/legal/licencas" className="hover:text-foreground">Licenças</Link>
      </nav>
    </footer>
  );
};

export default AppFooter;
