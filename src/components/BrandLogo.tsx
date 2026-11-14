import type { CSSProperties } from "react";
import { Building2, Home } from "lucide-react";

interface BrandLogoProps {
  height?: number;
  showText?: boolean;
  className?: string;
  style?: CSSProperties;
  dark?: boolean;
}

export function BrandLogo({
  height = 40,
  showText = true,
  className = "",
  style,
  dark = false,
}: BrandLogoProps) {
  const iconSize = height;

  return (
    <div
      className={`flex items-center gap-2.5 select-none ${className}`}
      style={style}
    >
      {/* Insígnia Oficial Habittat House */}
      <div
        className="shrink-0 rounded-2xl flex items-center justify-center transition-transform hover:scale-105 duration-200"
        style={{
          width: iconSize,
          height: iconSize,
          background: dark
            ? "linear-gradient(135deg, #14161b 0%, #1e222a 100%)"
            : "linear-gradient(135deg, #1a3828 0%, #244d37 100%)",
          boxShadow: dark
            ? "0 4px 15px rgba(0, 0, 0, 0.4), 0 0 1px rgba(197, 168, 128, 0.3) inset"
            : "0 4px 12px rgba(26, 56, 40, 0.2)",
          border: dark ? "1px solid rgba(197, 168, 128, 0.3)" : "1px solid rgba(255, 255, 255, 0.2)",
        }}
      >
        <Home className="w-5 h-5 text-amber-200 drop-shadow-xs" strokeWidth={2} />
      </div>

      {/* Wordmark */}
      {showText && (
        <div className="flex flex-col justify-center leading-none">
          <div className="flex items-center text-sm sm:text-base font-serif font-black tracking-wider">
            <span style={{ color: dark ? "#FFFFFF" : "#121316" }}>
              ISMAEL
            </span>
            <span
              style={{
                color: dark ? "#c5a880" : "#8b6f47",
              }}
              className="ml-1.5"
            >
              DIAS
            </span>
          </div>
          <span
            className="text-[8px] sm:text-[9px] uppercase font-sans font-bold tracking-widest mt-0.5"
            style={{ color: dark ? "#a1a7b4" : "#525866" }}
          >
            CORRETOR • HABITTAT HOUSE
          </span>
        </div>
      )}
    </div>
  );
}

export default BrandLogo;

