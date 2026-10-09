import { useEffect, useRef } from "react";

export function CursorEffects() {
  const orbRef = useRef<HTMLDivElement | null>(null);
  const dotRef = useRef<HTMLDivElement | null>(null);
  const posRef = useRef({ x: -200, y: -200 });
  const rafRef = useRef<number | undefined>(undefined);
  const isMovingRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Only activate on devices with a mouse/precision cursor
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const orb = orbRef.current;
    const dot = dotRef.current;
    if (!orb || !dot) return;

    let currentX = -200;
    let currentY = -200;

    const render = () => {
      // GPU accelerated lerp
      currentX += (posRef.current.x - currentX) * 0.16;
      currentY += (posRef.current.y - currentY) * 0.16;

      orb.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;
      dot.style.transform = `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0) translate(-50%, -50%)`;

      if (Math.abs(posRef.current.x - currentX) > 0.15 || Math.abs(posRef.current.y - currentY) > 0.15) {
        rafRef.current = requestAnimationFrame(render);
      } else {
        isMovingRef.current = false;
        rafRef.current = undefined;
      }
    };

    const startRender = () => {
      if (!isMovingRef.current) {
        isMovingRef.current = true;
        rafRef.current = requestAnimationFrame(render);
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      startRender();
    };

    // Single delegated listener for hover states across all interactive elements
    const onMouseOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest?.('a, button, [role="button"], input, select');
      if (target) {
        dot.classList.add("hovered");
      } else {
        dot.classList.remove("hovered");
      }
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mouseover", onMouseOver, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseover", onMouseOver);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <>
      <div ref={orbRef} className="cursor-glow-orb" aria-hidden="true" style={{ top: 0, left: 0, willChange: "transform" }} />
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" style={{ top: 0, left: 0, willChange: "transform" }} />
    </>
  );
}

export default CursorEffects;
