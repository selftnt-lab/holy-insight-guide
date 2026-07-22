
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
    sm: "h-10 min-w-[40px]",
    md: "h-20 min-w-[80px]",
    lg: "h-32 min-w-[128px]",
    xl: "h-72 min-w-[288px]",
  };

  return (
    <div className={cn("relative flex items-center justify-center overflow-visible", sizeClasses[size], className)}>
      <div className="absolute inset-0 flex items-center justify-center">
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
    </div>
  );
};

export default BrandLogo;
