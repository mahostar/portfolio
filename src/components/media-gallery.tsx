"use client";

import Image from "next/image";
import { useId, useRef, useState } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight, Images, Play, X } from "lucide-react";
import type { EvidenceItem } from "@/lib/evidence";
import styles from "./media-gallery.module.css";

export function MediaGallery({ items: sourceItems, title, compact = false, story }: {
  items: EvidenceItem[];
  title: string;
  compact?: boolean;
  story?: string;
}) {
  const items = [...sourceItems].sort((a, b) => Number(a.type === "video") - Number(b.type === "video"));
  if (items.length && items.every((item) => item.type === "video")) {
    const first = items[0];
    items.unshift({ ...first, id: `${first.id}-preview`, type: "image", src: first.preview, caption: `${first.caption} · Video preview`, alt: `Still preview of ${first.caption}` });
  }
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const [index, setIndex] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);
  const labelId = useId();
  const selected = index === null ? null : items[index];
  if (!items.length) return null;
  const open = (position: number, trigger: HTMLElement) => {
    opener.current = trigger;
    setIndex(position);
    dialog.current?.showModal();
  };
  const move = (direction: number) => setIndex((current) =>
    current === null ? null : (current + direction + items.length) % items.length);
  return (
    <div className={compact ? styles.compact : styles.gallery}>
      {compact ? (
        <button className={story ? styles.storyLauncher : styles.launcher} onClick={(event) => open(0, event.currentTarget)}>
          {story ? <>Read the story <ArrowUpRight size={16} /></> : <><Images size={16} /> View gallery <span>{items.length}</span></>}
        </button>
      ) : (
        <>
          <div className={styles.heading}><h2>{title}</h2><span>{items.length} photos &amp; videos</span></div>
          <div className={styles.grid}>
            {(expanded ? items : items.slice(0, 6)).map((item, position) => (
              <button className={styles.tile} key={item.id} onClick={(event) => open(position, event.currentTarget)} aria-label={`Open ${item.caption}`}>
                <span className={styles.preview}>
                  <Image src={item.thumbnail} alt={item.alt} fill sizes="(max-width: 767px) 45vw, 360px" unoptimized />
                  {item.type === "video" && <span className={styles.play}><Play size={18} fill="currentColor" /></span>}
                  {item.concept && <span className={styles.badge}>Concept visual</span>}
                </span>
                <span className={styles.caption}>{item.caption}</span>
              </button>
            ))}
          </div>
          {items.length > 6 && <button className={styles.more} onClick={() => setExpanded(!expanded)}>{expanded ? "Show fewer" : `Show all ${items.length} photos & videos`}</button>}
        </>
      )}
      <dialog ref={dialog} className={styles.dialog} aria-labelledby={labelId}
        onClose={() => { setIndex(null); opener.current?.focus(); }}
        onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close(); }}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") {event.preventDefault();move(-1);}
          if (event.key === "ArrowRight") {event.preventDefault();move(1);}
        }}>
        <div className={styles.viewer}>
          <header><div><p>{title}</p><h3 id={labelId}>{selected?.caption}</h3></div><button aria-label="Close gallery" autoFocus onClick={() => dialog.current?.close()}><X size={24} /></button></header>
          {story && <p className={styles.storyText}>{story}</p>}
          {selected && <div className={styles.stage}>
            {selected.type === "video" ? <video key={selected.src} src={selected.src} poster={selected.preview} controls playsInline preload="none" aria-label={selected.caption} /> : <Image src={selected.src} alt={selected.alt} width={selected.width} height={selected.height} sizes="95vw" unoptimized />}
          </div>}
          <footer><button aria-label="Previous media" disabled={items.length < 2} onClick={() => move(-1)}><ChevronLeft size={22} /></button><span aria-live="polite">{index === null ? 0 : index + 1} / {items.length}{selected?.concept ? " · Concept visual" : ""}</span><button aria-label="Next media" disabled={items.length < 2} onClick={() => move(1)}><ChevronRight size={22} /></button></footer>
        </div>
      </dialog>
    </div>
  );
}
