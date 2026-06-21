import type { CSSProperties, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";

import { type SceneKey } from "@/components/sceneAssets";
import { useSceneScrollPan } from "@/components/useSceneScrollPan";

export type { SceneKey } from "@/components/sceneAssets";

interface SceneBackgroundProps {
  scene: SceneKey;
  children: ReactNode;
  className?: string;
}

const HEADER_OFFSET = "var(--site-header-height, 3.5rem)";

function headerHeightPx(): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue("--site-header-height");
  const parsed = parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : 56;
}

function sceneFilter(scene: SceneKey, isDark: boolean): string {
  if (scene === "pantry") {
    return isDark
      ? "brightness(0.35) saturate(0.7) contrast(1.1)"
      : "brightness(1) saturate(1.05)";
  }
  return isDark
    ? "brightness(0.42) saturate(0.78) contrast(1.05)"
    : "brightness(1.02) saturate(1.06) contrast(1.02)";
}

function sceneOverlay(scene: SceneKey, isDark: boolean): string {
  if (scene === "pantry") {
    return isDark
      ? "from-stone-950/70 via-stone-900/40 to-stone-950/75"
      : "from-white/25 via-white/10 to-amber-50/30";
  }
  return isDark
    ? "from-stone-950/50 via-stone-900/15 to-stone-950/60"
    : "from-amber-50/20 via-white/5 to-orange-100/15";
}

function sceneFallbackClass(scene: SceneKey, isDark: boolean): string {
  if (scene === "pantry") {
    return isDark ? "bg-stone-950" : "bg-[#f5efe6]";
  }
  return isDark ? "bg-stone-950" : "bg-amber-50";
}

/**
 * Illustrated scene at full viewport width (no horizontal crop). Scroll the page
 * to pan vertically through the image and see parts that would be cut off by cover.
 */
export function SceneBackground({ scene, children, className = "" }: SceneBackgroundProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { panY, src, scaledHeight } = useSceneScrollPan(scene);
  const mainRef = useRef<HTMLDivElement>(null);
  const scrollPadRef = useRef(0);
  const [scrollPad, setScrollPad] = useState(0);

  useEffect(() => {
    const el = mainRef.current;
    if (!el || !scaledHeight) return;

    const measure = () => {
      const viewH = window.innerHeight - headerHeightPx();
      const maxPan = Math.max(0, scaledHeight - viewH);

      // Cover scenes (pantry, taste) fill the viewport — skip pan padding to avoid layout jitter.
      if (scene === "pantry" || scene === "taste") {
        if (scrollPadRef.current !== 0) {
          scrollPadRef.current = 0;
          setScrollPad(0);
        }
        return;
      }

      if (maxPan === 0) {
        if (scrollPadRef.current !== 0) {
          scrollPadRef.current = 0;
          setScrollPad(0);
        }
        return;
      }

      // Measure scroll range without the spacer to avoid a resize feedback loop.
      const docHeight = document.documentElement.scrollHeight;
      const naturalScrollRange = Math.max(
        0,
        docHeight - scrollPadRef.current - window.innerHeight,
      );
      const nextPad = Math.max(0, Math.round(maxPan - naturalScrollRange));

      if (Math.abs(nextPad - scrollPadRef.current) <= 1) return;
      scrollPadRef.current = nextPad;
      setScrollPad(nextPad);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [scaledHeight, scene]);

  // Cover scenes fill the viewport at center; others pan vertically with scroll.
  const isCover = scene === "pantry" || scene === "taste";

  const imageStyle: CSSProperties = {
    top: HEADER_OFFSET,
    backgroundImage: `url(${src})`,
    filter: sceneFilter(scene, isDark),
    backgroundRepeat: "no-repeat",
    backgroundSize: isCover ? "cover" : "100% auto",
    backgroundPosition: isCover ? "center center" : `center ${-panY}px`,
  };

  return (
    <div className={`relative isolate flex min-h-0 flex-1 flex-col ${className}`}>
      <div
        className={`pointer-events-none fixed inset-x-0 bottom-0 z-0 ${sceneFallbackClass(scene, isDark)}`}
        style={{ top: HEADER_OFFSET }}
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-0 bg-no-repeat"
        style={imageStyle}
        aria-hidden
      />
      <div
        className={`pointer-events-none fixed inset-x-0 bottom-0 z-0 bg-gradient-to-b transition-opacity duration-500 ${sceneOverlay(scene, isDark)}`}
        style={{ top: HEADER_OFFSET }}
        aria-hidden
      />
      <div className="relative z-10 flex flex-1 flex-col">
        <div ref={mainRef} className="flex flex-1 flex-col">
          {children}
        </div>
        {scrollPad > 0 && (
          <div
            aria-hidden
            className="pointer-events-none shrink-0"
            style={{ height: scrollPad }}
          />
        )}
      </div>
    </div>
  );
}
