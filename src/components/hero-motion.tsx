"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { useMotionPreference } from "@/lib/use-motion-preference";

export function HeroMotion({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useMotionPreference();
  useEffect(() => {
    const node = ref.current;
    const copy = node?.querySelector<HTMLElement>(".hero-copy");
    const heading = copy?.querySelector<HTMLElement>("h1");
    if (!copy || !heading) return;
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) return;
    let lastWidth = 0;
    let disposed = false;
    const fit = () => {
      if (disposed || copy.clientWidth === lastWidth) return;
      lastWidth = copy.clientWidth;
      copy.style.setProperty("--name-fit", "1");
      const longest = Math.max(
        ...[...heading.children].map((line) => {
          const style = getComputedStyle(line);
          context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
          const tracking = parseFloat(style.letterSpacing) || 0;
          const raw = line.textContent || "";
          const text = style.textTransform === "uppercase" ? raw.toUpperCase() : raw;
          return (
            context.measureText(text).width + tracking * Math.max(0, text.length - 1)
          );
        }),
      );
      copy.style.setProperty(
        "--name-fit",
        String(Math.min(1, (copy.clientWidth - 4) / longest)),
      );
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(copy);
    document.fonts.ready.then(() => {
      lastWidth = 0;
      fit();
    });
    return () => {
      disposed = true;
      observer.disconnect();
    };
  }, []);
  useEffect(() => {
    const node = ref.current;
    if (!node || reduced) return;
    node.dataset.motion = "ready";
    const observer = new IntersectionObserver(([entry]) =>
      node.classList.toggle("hero-paused", !entry.isIntersecting),
    );
    observer.observe(node);
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    let frame = 0;
    const move = (event: PointerEvent) => {
      if (!fine.matches) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const bounds = node.getBoundingClientRect();
        node.style.setProperty(
          "--px",
          `${((event.clientX - bounds.left) / bounds.width - 0.5) * 2}`,
        );
        node.style.setProperty(
          "--py",
          `${((event.clientY - bounds.top) / bounds.height - 0.5) * 2}`,
        );
        const copy = node.querySelector<HTMLElement>(".hero-copy");
        if (copy) {
          const textBounds = (
            copy.querySelector<HTMLElement>(".name-outline") || copy
          ).getBoundingClientRect();
          copy.style.setProperty(
            "--name-light-x",
            `${event.clientX - textBounds.left}px`,
          );
          copy.style.setProperty("--name-light-y", `${event.clientY - textBounds.top}px`);
        }
      });
    };
    const reset = () => {
      cancelAnimationFrame(frame);
      node.style.setProperty("--px", "0");
      node.style.setProperty("--py", "0");
      node
        .querySelector<HTMLElement>(".hero-copy")
        ?.style.setProperty("--name-light-x", "-300px");
    };
    node.addEventListener("pointermove", move);
    node.addEventListener("pointerleave", reset);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      node.removeEventListener("pointermove", move);
      node.removeEventListener("pointerleave", reset);
      delete node.dataset.motion;
    };
  }, [reduced]);
  return (
    <div
      ref={ref}
      className="hero-scene"
      style={{ "--px": 0, "--py": 0 } as CSSProperties}
    >
      {children}
    </div>
  );
}
