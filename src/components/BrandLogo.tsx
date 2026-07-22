
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
      {/* Simplified single image with CSS filter approach for reliability */}
      <img
        src={logoLight.url}
        alt="RC Bible"
        className={cn(
          "h-full w-auto object-contain transition-all duration-300",
          theme === "dark" ? "invert brightness-[2] contrast-[1.2]" : "none"
        )}
      />
    </div>
  );
};

export default BrandLogo;
