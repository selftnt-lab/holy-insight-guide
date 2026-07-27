import logo from "@/assets/rc-bible-logo.png";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "h-10 min-w-[40px]",
  md: "h-20 min-w-[80px]",
  lg: "h-32 min-w-[128px]",
  xl: "h-72 min-w-[288px]",
};

const BrandLogo = ({ className, size = "md" }: BrandLogoProps) => {
  return (
    <div className={cn("relative flex items-center justify-center overflow-visible", sizeClasses[size], className)}>
      <div className="absolute inset-0 flex items-center justify-center">
        <img src={logo} alt="RC Bible" className="h-full w-auto object-contain" />
      </div>
    </div>
  );
};

export default BrandLogo;
