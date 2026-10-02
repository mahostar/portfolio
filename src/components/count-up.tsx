"use client";

import { useEffect, useRef } from "react";

export function CountUp({ value }: { value: number | null }) {
  const number = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const element = number.current;
    if (!element || value === null || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    let started = false;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || started) return;
      started = true;
      observer.disconnect();
      const start = performance.now();
      element.textContent = "0";
      const tick = (now: number) => {
        const progress = Math.min(1, (now - start) / 1200);
        element.textContent = String(Math.round(value * (1 - (1 - progress) ** 3)));
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }, { threshold: 0.5 });
    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);
  return <span aria-label={String(value ?? "—")} data-count-up={value ?? undefined}><span ref={number} aria-hidden="true">{value ?? "—"}</span></span>;
}
