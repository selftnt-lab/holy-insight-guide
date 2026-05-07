import { useLocation } from "react-router-dom";
import novusLogo from "@/assets/novus-ai-logo.png";

const AppFooter = () => {
  const location = useLocation();
  if (location.pathname === "/auth") return null;

  return (
    <footer className="mx-auto mb-24 mt-8 flex max-w-lg items-center justify-center gap-2 px-5 pb-2 text-xs text-muted-foreground">
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
