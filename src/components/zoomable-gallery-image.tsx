"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import { Minus, Plus, RotateCcw } from "lucide-react";
import type { EvidenceItem } from "@/lib/evidence";
import styles from "./media-gallery.module.css";

type Point = { x: number; y: number };
type View = { scale: number; x: number; y: number };
const initial: View = { scale: 1, x: 0, y: 0 };

export function ZoomableGalleryImage({ item }: { item: EvidenceItem }) {
  const surface = useRef<HTMLDivElement>(null);
  const pointers = useRef(new Map<number, Point>());
  const current = useRef<View>(initial);
  const gesture = useRef({ view: initial, center: { x: 0, y: 0 }, distance: 0 });
  const [view, setView] = useState(initial);
  const measure = () => {
    const points = [...pointers.current.values()].slice(0, 2);
    const center = points.length === 2
      ? { x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2 }
      : points[0] ?? { x: 0, y: 0 };
    const distance = points.length === 2 ? Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y) : 0;
    return { center, distance };
  };
  const rebase = () => { gesture.current = { view: current.current, ...measure() }; };
  const update = useCallback((next: View) => {
    const rect = surface.current?.getBoundingClientRect();
    const scale = Math.min(6, Math.max(1, next.scale));
    const limitX = (rect?.width ?? 0) * (scale - 1) / 2;
    const limitY = (rect?.height ?? 0) * (scale - 1) / 2;
    const bounded = { scale, x: Math.max(-limitX, Math.min(limitX, next.x)), y: Math.max(-limitY, Math.min(limitY, next.y)) };
    current.current = bounded;
    setView(bounded);
  }, []);
  useEffect(() => {
    const element = surface.current;
    if (!element) return;
    const wheel = (event: WheelEvent) => {
      event.preventDefault();
      const rect = element.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      const previous = current.current;
      const units = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? rect.height : 1;
      const scale = Math.min(6, Math.max(1, previous.scale * Math.exp(-event.deltaY * units * 0.002)));
      const ratio = scale / previous.scale;
      update({ scale, x: x - (x - previous.x) * ratio, y: y - (y - previous.y) * ratio });
    };
    element.addEventListener("wheel", wheel, { passive: false });
    return () => element.removeEventListener("wheel", wheel);
  }, [update]);
  const position = (event: PointerEvent<HTMLDivElement>): Point => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left - rect.width / 2, y: event.clientY - rect.top - rect.height / 2 };
  };
  const release = (event: PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(event.pointerId);
    rebase();
  };
  const zoom = (factor: number) => {
    const scale = Math.min(6, Math.max(1, current.current.scale * factor));
    const ratio = scale / current.current.scale;
    update({ scale, x: current.current.x * ratio, y: current.current.y * ratio });
    rebase();
  };
  return <>
    <div ref={surface} className={styles.zoomSurface} data-image-zoom={view.scale.toFixed(2)}
      style={{ cursor: view.scale > 1 ? "grab" : "default" }}
      onPointerDown={(event) => {
        if (event.pointerType === "mouse" && event.button !== 0) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        pointers.current.set(event.pointerId, position(event));
        rebase();
      }}
      onPointerMove={(event) => {
        if (!pointers.current.has(event.pointerId)) return;
        pointers.current.set(event.pointerId, position(event));
        const { center, distance } = measure();
        const start = gesture.current;
        const scale = start.distance > 0 && distance > 0
          ? Math.min(6, Math.max(1, start.view.scale * distance / start.distance)) : start.view.scale;
        const ratio = scale / start.view.scale;
        update({ scale, x: center.x - (start.center.x - start.view.x) * ratio,
          y: center.y - (start.center.y - start.view.y) * ratio });
      }}
      onPointerUp={release} onPointerCancel={release} onLostPointerCapture={release}
      onDoubleClick={() => { update(view.scale > 1 ? initial : { scale: 2, x: 0, y: 0 }); rebase(); }}>
      <Image src={item.src} alt={item.alt} width={item.width} height={item.height} sizes="95vw" unoptimized draggable={false}
        style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`, transformOrigin: "center" }} />
    </div>
    <div className={styles.zoomTools} aria-label="Image zoom controls">
      <button type="button" aria-label="Zoom out" disabled={view.scale <= 1} onClick={() => zoom(1 / 1.5)}><Minus size={18} /></button>
      <button type="button" aria-label="Reset image zoom" disabled={view.scale === 1} onClick={() => { update(initial); rebase(); }}><RotateCcw size={18} /></button>
      <button type="button" aria-label="Zoom in" disabled={view.scale >= 6} onClick={() => zoom(1.5)}><Plus size={18} /></button>
    </div>
  </>;
}
