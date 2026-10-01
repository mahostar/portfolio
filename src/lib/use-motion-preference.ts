"use client";

import { useEffect, useState } from "react";

export function useMotionPreference() {
  const [paused, setPaused] = useState(true);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () =>
      setPaused(media.matches || document.documentElement.dataset.motion === "paused");
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-motion"],
    });
    media.addEventListener("change", sync);
    sync();
    return () => {
      observer.disconnect();
      media.removeEventListener("change", sync);
    };
  }, []);
  return paused;
}
