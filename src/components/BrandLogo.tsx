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
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0284c7 100%)",
          boxShadow: dark
            ? "0 4px 15px rgba(2, 132, 199, 0.35), 0 0 1px rgba(255,255,255,0.2) inset"
            : "0 4px 12px rgba(15, 23, 42, 0.15)",
          border: "1px solid rgba(255,255,255,0.15)",
        }}
      >
        <Home className="w-5 h-5 text-white drop-shadow-sm" strokeWidth={2.2} />
      </div>

      {/* Wordmark */}
      {showText && (
        <div className="flex flex-col justify-center leading-none">
          <div className="flex items-center text-lg sm:text-xl font-black tracking-tight">
            <span style={{ color: dark ? "#FFFFFF" : "#0f172a" }}>
              HABITTAT
            </span>
            <span
              style={{
                background: "linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
              className="ml-1"
            >
              HOUSE
            </span>
          </div>
          <span
            className="text-[9px] uppercase font-bold tracking-[0.2em] mt-0.5"
            style={{ color: dark ? "#94a3b8" : "#64748b" }}
          >
            IMOBILIÁRIA • TERESÓPOLIS
          </span>
        </div>
      )}
    </div>
  );
}

export default BrandLogo;

