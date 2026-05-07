import { useLocation } from "react-router-dom";
import novusInsightLogo from "@/assets/novus-insight-logo.png";

const AppHeader = () => {
  const location = useLocation();
  if (location.pathname === "/auth") return null;

  return (
    <header className="flex items-center justify-center px-5 py-3">
      <img
        src={novusInsightLogo}
        alt="NOVUS Insight - Estudo Bíblico"
        className="h-20 w-auto object-scale-down"
      />
    </header>
  );
};

export default AppHeader;
