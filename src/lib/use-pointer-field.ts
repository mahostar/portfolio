"use client";

import { useEffect, type RefObject } from "react";
import { motionAllowed } from "./motion";

export type PointerFrame = {
  x: number;
  y: number;
  nx: number;
  ny: number;
  width: number;
  height: number;
};

export function usePointerField(
  host: RefObject<HTMLElement | null>,
  onFrame?: (frame: PointerFrame) => void,
) {
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    let rect = element.getBoundingClientRect();
    const current = { x: rect.width * 0.72, y: rect.height * 0.5 },
      target = { ...current };
    let frame = 0,
      last = 0,
      visible = true;
    const allowed = () => fine.matches && motionAllowed() && visible && !document.hidden;
    const write = () => {
      const nx = rect.width ? (current.x / rect.width) * 2 - 1 : 0;
      const ny = rect.height ? (current.y / rect.height) * 2 - 1 : 0;
      element.style.setProperty("--lx", `${current.x}px`);
      element.style.setProperty("--ly", `${current.y}px`);
      element.style.setProperty("--mx", String(nx));
      element.style.setProperty("--my", String(ny));
      onFrame?.({ ...current, nx, ny, width: rect.width, height: rect.height });
    };
    const tick = (time: number) => {
      frame = 0;
      if (!allowed()) {
        last = 0;
        return;
      }
      const dt = last ? Math.min(time - last, 64) : 16.7;
      last = time;
      const ease = 1 - Math.pow(0.92, dt / 16.7);
      current.x += (target.x - current.x) * ease;
      current.y += (target.y - current.y) * ease;
      write();
      if (Math.abs(target.x - current.x) < 0.1 && Math.abs(target.y - current.y) < 0.1) {
        last = 0;
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    const wake = () => {
      if (!frame && allowed()) frame = requestAnimationFrame(tick);
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      last = 0;
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType === "touch" || !allowed()) return;
      rect = element.getBoundingClientRect();
      target.x = event.clientX - rect.left;
      target.y = event.clientY - rect.top;
      element.dataset.pointer = "inside";
      wake();
    };
    const leave = () => {
      delete element.dataset.pointer;
      target.x = rect.width * 0.72;
      target.y = rect.height * 0.5;
      wake();
    };
    const sync = () => {
      if (!allowed()) {
        stop();
        delete element.dataset.pointer;
      } else wake();
    };
    const resize = new ResizeObserver(() => {
      rect = element.getBoundingClientRect();
      current.x = target.x = rect.width * 0.72;
      current.y = target.y = rect.height * 0.5;
      write();
    });
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      element.dataset.visible = String(visible && !document.hidden);
      sync();
    });
    const switchObserver = new MutationObserver(sync);
    switchObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-motion"],
    });
    resize.observe(element);
    intersection.observe(element);
    write();
    element.addEventListener("pointermove", move, { passive: true });
    element.addEventListener("pointerleave", leave);
    const visibility = () => {
      element.dataset.visible = String(visible && !document.hidden);
      sync();
    };
    document.addEventListener("visibilitychange", visibility);
    fine.addEventListener("change", sync);
    return () => {
      stop();
      resize.disconnect();
      intersection.disconnect();
      switchObserver.disconnect();
      element.removeEventListener("pointermove", move);
      element.removeEventListener("pointerleave", leave);
      document.removeEventListener("visibilitychange", visibility);
      fine.removeEventListener("change", sync);
    };
  }, [host, onFrame]);
}
