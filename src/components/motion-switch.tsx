"use client";

import { useEffect } from "react";

export function MotionSwitch() {
  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const root = document.documentElement;
    const sync = () => {
      let saved: string | null = null;
      try {
        saved = localStorage.getItem("portfolio-motion");
      } catch {
        /* Optional storage. */
      }
      root.dataset.motion =
        preference.matches || saved === "paused" ? "paused" : "running";
      // Pause both CSS and WAAPI animations, including the temporary P4 tree.
      for (const animation of document.getAnimations()) {
        if (root.dataset.motion === "paused") animation.pause();
        else if (animation.playState === "paused") animation.play();
      }
    };
    const observer = new MutationObserver(() => {
      for (const animation of document.getAnimations()) {
        if (root.dataset.motion === "paused") animation.pause();
        else if (animation.playState === "paused") animation.play();
      }
    });
    observer.observe(root, { attributes: true, attributeFilter: ["data-motion"] });
    sync();
    preference.addEventListener("change", sync);
    return () => {
      observer.disconnect();
      preference.removeEventListener("change", sync);
    };
  }, []);
  return null;
}
