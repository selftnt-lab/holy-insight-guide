
import { useTheme } from "@/components/ThemeProvider";
import logoLight from "@/assets/rc-bible-logo-new.png.asset.json";
import logoDark from "@/assets/rc-bible-logo-new.png.asset.json";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const BrandLogo = ({ className, size = "md" }: BrandLogoProps) => {
  const { theme } = useTheme();

  const sizeClasses = {
    sm: "h-8 w-auto min-w-[32px]",
    md: "h-16 w-auto min-w-[64px]",
    lg: "h-24 w-auto min-w-[96px]",
    xl: "h-64 w-auto min-w-[256px]",
  };

  return (
    <div className={cn("relative flex items-center justify-center overflow-visible", sizeClasses[size], className)}>
      {/* Light Logo */}
      <img
        src={logoLight.url}
        alt="RC Bible"
        className={cn(
          "absolute inset-0 h-full w-full object-contain transition-opacity duration-500 ease-in-out",
          theme === "light" ? "opacity-100" : "opacity-0"
        )}
        style={{
          filter: theme === "light" ? "none" : "invert(1) brightness(2)"
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
          filter: theme === "dark" ? "invert(1) brightness(2)" : "none"
        }}
      />
    </div>
  );
};

export default BrandLogo;
