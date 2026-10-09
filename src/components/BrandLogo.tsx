import type { CSSProperties } from "react";

export const TEREPHONES_LOGO_URL = "https://ik.imagekit.io/zinma/tr:w-160,f-auto,q-85/TerePhones-Logo.png";

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
      {/* Insígnia Oficial Terephones */}
      <img
        src={TEREPHONES_LOGO_URL}
        alt="Terephones"
        width={iconSize}
        height={iconSize}
        className="shrink-0 object-contain rounded-full transition-transform hover:scale-105 duration-200"
        style={{
          width: iconSize,
          height: iconSize,
          filter: dark
            ? "drop-shadow(0 2px 8px rgba(0,0,0,0.5)) drop-shadow(0 0 10px rgba(56,189,248,0.25))"
            : "drop-shadow(0 2px 6px rgba(13,27,62,0.18))",
        }}
        loading="eager"
        decoding="async"
      />

      {/* Wordmark */}
      {showText && (
        <div className="flex flex-col justify-center leading-none">
          <div className="flex items-center text-lg sm:text-xl font-black tracking-tight">
            <span style={{ color: dark ? "#FFFFFF" : "var(--text-primary, #0D1B3E)" }}>
              TERE
            </span>
            <span
              style={{
                background: "linear-gradient(135deg, #1A6FE8 0%, #2979FF 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
              className="ml-0.5"
            >
              PHONES
            </span>
          </div>
          <span
            className="text-[9px] uppercase font-bold tracking-[0.22em] mt-0.5"
            style={{ color: dark ? "#94A3B8" : "var(--text-muted, #64748B)" }}
          >
            TERESÓPOLIS • RJ
          </span>
        </div>
      )}
    </div>
  );
}

export default BrandLogo;
