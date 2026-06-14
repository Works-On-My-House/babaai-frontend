import { useEffect, useRef, useState } from "react";

import { SCENE_IMAGES, type SceneKey } from "@/components/sceneAssets";

function headerHeightPx(): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue("--site-header-height");
  const parsed = parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : 56;
}

/**
 * Full-width scene at natural aspect ratio; vertical pan follows page scroll so
 * users can reveal the entire illustration on long pages without `cover` cropping.
 */
export function useSceneScrollPan(scene: SceneKey) {
  const src = SCENE_IMAGES[scene];
  const [scaledHeight, setScaledHeight] = useState(0);
  const [panY, setPanY] = useState(0);
  const panRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.src = src;
    const measure = () => {
      if (cancelled || !img.naturalWidth) return;
      const scale = window.innerWidth / img.naturalWidth;
      setScaledHeight(img.naturalHeight * scale);
    };
    img.onload = measure;
    if (img.complete) measure();
    return () => {
      cancelled = true;
    };
  }, [src]);

  useEffect(() => {
    if (!scaledHeight) return;

    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const viewportH = window.innerHeight - headerHeightPx();
        const maxPan = Math.max(0, scaledHeight - viewportH);
        const scrollRange = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

        const nextPan =
          maxPan === 0 || scrollRange === 0
            ? 0
            : Math.min(maxPan, (window.scrollY / scrollRange) * maxPan);

        if (Math.abs(nextPan - panRef.current) < 0.5) return;
        panRef.current = nextPan;
        setPanY(nextPan);
      });
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [scaledHeight]);

  return { panY, src, scaledHeight };
}
