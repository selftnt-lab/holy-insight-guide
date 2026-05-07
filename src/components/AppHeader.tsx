import { useLocation } from "react-router-dom";
import novusInsightLogo from "@/assets/novus-insight-logo.png";

const AppHeader = () => {
  const location = useLocation();
  if (location.pathname === "/auth") return null;

  return (
    <header className="sticky top-0 z-40 flex items-center justify-center border-b border-border/60 bg-background/80 px-5 py-2 backdrop-blur-xl">
      <img
        src={novusInsightLogo}
        alt="NOVUS Insight - Estudo Bíblico"
        className="h-10 w-auto rounded-md object-scale-down"
      />
    </header>
  );
};

export default AppHeader;
