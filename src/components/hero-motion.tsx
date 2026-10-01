"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { useReducedMotion } from "motion/react";
import * as m from "motion/react-m";

export function HeroMotion({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
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
      const style = getComputedStyle(heading);
      context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      const tracking = parseFloat(style.letterSpacing) || 0;
      const longest = Math.max(...[...heading.children].map((line) => {
        const text = line.textContent || "";
        return context.measureText(text).width + tracking * Math.max(0, text.length - 1);
      }));
      copy.style.setProperty("--name-fit", String(Math.min(1, (copy.clientWidth - 4) / longest)));
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(copy);
    document.fonts.ready.then(() => { lastWidth = 0; fit(); });
    return () => { disposed = true; observer.disconnect(); };
  }, []);
  useEffect(() => {
    const node = ref.current;
    if (!node || reduced) return;
    node.dataset.motion = "ready";
    const observer = new IntersectionObserver(([entry]) => node.classList.toggle("hero-paused", !entry.isIntersecting));
    observer.observe(node);
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    let frame = 0;
    const move = (event: PointerEvent) => {
      if (!fine.matches) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const bounds = node.getBoundingClientRect();
        node.style.setProperty("--px", `${((event.clientX - bounds.left) / bounds.width - 0.5) * 2}`);
        node.style.setProperty("--py", `${((event.clientY - bounds.top) / bounds.height - 0.5) * 2}`);
      });
    };
    const reset = () => { cancelAnimationFrame(frame); node.style.setProperty("--px", "0"); node.style.setProperty("--py", "0"); };
    node.addEventListener("pointermove", move);
    node.addEventListener("pointerleave", reset);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); node.removeEventListener("pointermove", move); node.removeEventListener("pointerleave", reset); delete node.dataset.motion; };
  }, [reduced]);
  return <m.div ref={ref} className="hero-scene" initial={false} style={{ "--px": 0, "--py": 0 } as CSSProperties}>{children}</m.div>;
}

export function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    const node = ref.current;
    if (!node || reduced) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      node.animate([{ transform: "translateY(24px)", opacity: 0.4 }, { transform: "translateY(0)", opacity: 1 }], { duration: 400, easing: "ease-out" });
      observer.disconnect();
    }, { threshold: 0.06 });
    observer.observe(node);
    return () => { observer.disconnect(); node.getAnimations().forEach((animation) => animation.cancel()); };
  }, [reduced]);
  return <m.div ref={ref} initial={false} className={className}>{children}</m.div>;
}
