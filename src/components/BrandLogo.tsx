
import { useTheme } from "@/components/ThemeProvider";
import logoLight from "@/assets/rc-bible-logo-light.png.asset.json";
import logoDark from "@/assets/rc-bible-logo-dark.png.asset.json";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const BrandLogo = ({ className, size = "md" }: BrandLogoProps) => {
  const { theme } = useTheme();

  const sizeClasses = {
    sm: "h-8",
    md: "h-16",
    lg: "h-24",
    xl: "h-64",
  };

  return (
    <div className={cn("relative flex items-center justify-center", sizeClasses[size], className)}>
      {/* Light Logo */}
      <img
        src={logoLight.url}
        alt="RC Bible"
        className={cn(
          "absolute inset-0 h-full w-full object-contain transition-opacity duration-500 ease-in-out",
          theme === "light" ? "opacity-100" : "opacity-0"
        )}
        style={{
          filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1)) drop-shadow(0 2px 4px rgba(0,0,0,0.06))"
        }}
      />
      
      {/* Dark Logo */}
      <img
        src={logoDark.url}
        alt="RC Bible"
        className={cn(
          "absolute inset-0 h-full w-full object-contain transition-opacity duration-500 ease-in-out",
          theme === "dark" ? "opacity-100" : "opacity-0"
        )}
        style={{
          filter: "drop-shadow(0 0 15px rgba(255,255,255,0.15)) drop-shadow(0 0 5px rgba(255,255,255,0.1))"
        }}
      />
    </div>
  );
};

export default BrandLogo;
