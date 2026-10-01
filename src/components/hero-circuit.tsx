"use client";

import { useEffect, useRef } from "react";
import { motionAllowed } from "@/lib/motion";

type Point = { x: number; y: number };
type Trace = {
  points: Point[];
  lengths: number[];
  total: number;
  phase: number;
  speed: number;
  warm: boolean;
};

// A routed circuit field, not a particle cloud. Each pulse follows the actual
// length of its copper trace, including the diagonal transitions.
export function HeroCircuit() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const host = canvas?.parentElement;
    const context = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !host || !context) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const pointer = { x: 0.72, y: 0.5 };
    let width = 1;
    let height = 1;
    let traces: Trace[] = [];
    let frame = 0;
    let visible = true;
    let lastTime = 0;
    let elapsed = 0;

    const build = () => {
      width = Math.max(1, host.clientWidth);
      height = Math.max(1, host.clientHeight);
      const ratio = Math.min(devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const count = width < 768 ? 12 : 22;
      traces = Array.from({ length: count }, (_, index) => {
        const fromRight = index % 2 === 0;
        const origin = fromRight ? width + 12 : -12;
        const direction = fromRight ? -1 : 1;
        const row = (index + 1) / (count + 1);
        const y = row * height;
        const reach = width * (0.09 + (index % 5) * 0.024);
        const diagonal = Math.min(34, height * 0.07) * (index % 3 === 0 ? -1 : 1);
        const points = [
          { x: origin, y },
          { x: origin + direction * reach, y },
          { x: origin + direction * (reach + Math.abs(diagonal)), y: y + diagonal },
          {
            x: origin + direction * (reach + Math.abs(diagonal) + width * 0.065),
            y: y + diagonal,
          },
        ];
        const lengths = points
          .slice(1)
          .map((point, i) => Math.hypot(point.x - points[i].x, point.y - points[i].y));
        return {
          points,
          lengths,
          total: lengths.reduce((sum, value) => sum + value, 0),
          phase: index * 57,
          speed: 28 + (index % 4) * 9,
          warm: index % 5 === 0,
        };
      });
    };
    const at = (trace: Trace, distance: number): Point => {
      let remaining = distance;
      for (let i = 0; i < trace.lengths.length; i++) {
        if (remaining <= trace.lengths[i]) {
          const ratio = remaining / trace.lengths[i];
          return {
            x: trace.points[i].x + (trace.points[i + 1].x - trace.points[i].x) * ratio,
            y: trace.points[i].y + (trace.points[i + 1].y - trace.points[i].y) * ratio,
          };
        }
        remaining -= trace.lengths[i];
      }
      return trace.points.at(-1)!;
    };
    const paint = () => {
      context.clearRect(0, 0, width, height);
      for (const trace of traces) {
        context.beginPath();
        trace.points.forEach((point, index) =>
          index ? context.lineTo(point.x, point.y) : context.moveTo(point.x, point.y),
        );
        context.strokeStyle = trace.warm
          ? "rgba(255,212,0,0.19)"
          : "rgba(155,210,255,0.14)";
        context.lineWidth = 0.8;
        context.stroke();
        const end = trace.points.at(-1)!;
        context.beginPath();
        context.arc(end.x, end.y, 3, 0, Math.PI * 2);
        context.stroke();
        const distance = (elapsed * trace.speed + trace.phase) % (trace.total + 110);
        if (distance > trace.total || !motionAllowed()) continue;
        const head = at(trace, distance);
        const proximity = Math.max(
          0,
          1 - Math.hypot(head.x - pointer.x * width, head.y - pointer.y * height) / 280,
        );
        for (let tail = 0; tail < 10; tail++) {
          if (distance - tail * 3 < 0) break;
          const point = at(trace, distance - tail * 3);
          context.beginPath();
          context.arc(point.x, point.y, tail === 0 ? 1.8 + proximity : 1, 0, Math.PI * 2);
          const alpha = (1 - tail / 10) * (0.48 + proximity * 0.4);
          context.fillStyle = trace.warm
            ? `rgba(255,224,91,${alpha})`
            : `rgba(179,228,255,${alpha})`;
          context.fill();
        }
      }
    };
    const tick = (time: number) => {
      frame = 0;
      if (!visible || document.hidden || !motionAllowed()) {
        lastTime = 0;
        return;
      }
      if (time - lastTime >= 1000 / 30) {
        elapsed += lastTime ? Math.min((time - lastTime) / 1000, 0.06) : 0;
        lastTime = time;
        paint();
      }
      frame = requestAnimationFrame(tick);
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
      paint();
      if (visible && !document.hidden && !!motionAllowed())
        frame = requestAnimationFrame(tick);
    };
    const resize = new ResizeObserver(() => {
      build();
      sync();
    });
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    const move = (event: PointerEvent) => {
      const bounds = host.getBoundingClientRect();
      pointer.x = (event.clientX - bounds.left) / bounds.width;
      pointer.y = (event.clientY - bounds.top) / bounds.height;
    };
    const switchObserver = new MutationObserver(sync);
    switchObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-motion"],
    });
    build();
    sync();
    resize.observe(host);
    intersection.observe(host);
    host.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("visibilitychange", sync);
    motion.addEventListener("change", sync);
    return () => {
      cancelAnimationFrame(frame);
      switchObserver.disconnect();
      resize.disconnect();
      intersection.disconnect();
      host.removeEventListener("pointermove", move);
      document.removeEventListener("visibilitychange", sync);
      motion.removeEventListener("change", sync);
    };
  }, []);
  return <canvas ref={ref} className="hero-circuit" aria-hidden="true" />;
}
