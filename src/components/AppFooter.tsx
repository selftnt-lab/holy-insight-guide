import { useLocation } from "react-router-dom";
import novusLogo from "@/assets/novus-ai-logo.png";

const AppFooter = () => {
  const location = useLocation();
  if (location.pathname === "/auth") return null;

  return (
    <footer className="fixed bottom-14 left-0 right-0 z-40 flex items-center justify-center gap-2 bg-background/80 py-1.5 text-xs text-muted-foreground backdrop-blur-sm">
      <span>Um produto</span>
      <img
        src={novusLogo}
        alt="NOVUS.AI"
        className="h-4 w-auto opacity-90 dark:brightness-0 dark:invert"
      />
    </footer>
  );
};

export default AppFooter;
