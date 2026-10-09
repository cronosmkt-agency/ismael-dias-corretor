import { useEffect } from "react";

declare global {
  interface Window {
    Tawk_API?: any;
    Tawk_LoadStart?: any;
  }
}

export function TawkFloatingWidget() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    // Ensure embedded mode is removed so Tawk displays its original floating widget
    if (window.Tawk_API.embedded) {
      try {
        delete window.Tawk_API.embedded;
      } catch {
        window.Tawk_API.embedded = undefined;
      }
    }

    // Set official Tawk customStyle before script loads to elevate above mobile footer
    window.Tawk_API.customStyle = {
      visibility: {
        desktop: {
          position: "br",
          xOffset: 16,
          yOffset: 24,
        },
        mobile: {
          position: "br",
          xOffset: 14,
          yOffset: 76,
        },
      },
    };

    // Dynamic adjustment to guarantee native widget stays above footer on mobile
    const adjustTawkMobilePosition = () => {
      if (window.innerWidth > 640) return;

      const iframes = document.querySelectorAll('iframe[src*="tawk.to"], iframe[title*="chat"]');
      iframes.forEach((iframe) => {
        const el = iframe as HTMLElement;
        const rect = el.getBoundingClientRect();
        // If it's the minimized launcher / preview bubble (not the full open window)
        if (rect.height > 0 && rect.height < 180) {
          el.style.setProperty("bottom", "calc(4.75rem + env(safe-area-inset-bottom))", "important");
        }
      });

      const tawkContainers = document.querySelectorAll('#tawk-default-container, .tawk-min-container, div[class*="widget-visible"]');
      tawkContainers.forEach((container) => {
        const el = container as HTMLElement;
        if (el.offsetHeight < 180) {
          el.style.setProperty("bottom", "calc(4.75rem + env(safe-area-inset-bottom))", "important");
        }
      });
    };

    const interval = setInterval(adjustTawkMobilePosition, 400);
    window.addEventListener("resize", adjustTawkMobilePosition);

    if (!document.getElementById("tawk-floating-script")) {
      const s1 = document.createElement("script");
      s1.id = "tawk-floating-script";
      s1.async = true;
      s1.src = "https://embed.tawk.to/6aac00529d89af3444bee888/1k2o8b0j4";
      s1.charset = "UTF-8";
      s1.setAttribute("crossorigin", "*");

      const s0 = document.getElementsByTagName("script")[0];
      if (s0 && s0.parentNode) {
        s0.parentNode.insertBefore(s1, s0);
      } else {
        document.head.appendChild(s1);
      }
    }

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", adjustTawkMobilePosition);
    };
  }, []);

  return null;
}

