"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import styles from "./signal-portfolio.module.css";
const sections = [
  ["work", "Work"],
  ["about", "About"],
  ["journey", "Journey"],
  ["interests", "Beyond"],
  ["impact", "Stories"],
  ["skills", "Toolkit"],
  ["certificates", "Proof"],
  ["contact", "Contact"],
];
export function SignalControls() {
  const rail = useRef<HTMLElement>(null);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const host = rail.current?.closest<HTMLElement>("[data-signal-site]");
    if (!host) return;
    try {
      if (localStorage.getItem("portfolio-lower-motion") === "paused") {
        host.dataset.motionPaused = "true";
        requestAnimationFrame(() => setPaused(true));
      }
    } catch {}
    const nodes = sections
      .map(([id]) => document.getElementById(id))
      .filter((node): node is HTMLElement => !!node);
    const hero = document.getElementById("home");
    let frame = 0;
    const update = () => {
      frame = 0;
      if (!rail.current) return;
      const end = document.documentElement.scrollHeight - innerHeight;
      const start = hero?.offsetTop
        ? hero.offsetTop + hero.offsetHeight
        : hero?.offsetHeight || 0;
      const value = Math.max(
        0,
        Math.min(1, (scrollY - start) / Math.max(1, end - start)),
      );
      rail.current.style.setProperty("--rail-progress", String(value));
      rail.current.dataset.visible = String(scrollY + 80 >= start);
      const current = nodes
        .filter((node) => node.getBoundingClientRect().top < innerHeight * 0.4)
        .at(-1)?.id;
      rail.current.querySelectorAll<HTMLAnchorElement>("a").forEach((link) => {
        if (link.hash === `#${current}`) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule);
    const resize = new ResizeObserver(schedule);
    resize.observe(host);
    update();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      removeEventListener("scroll", schedule);
      removeEventListener("resize", schedule);
    };
  }, []);
  const toggle = () => {
    const next = !paused;
    setPaused(next);
    const host = rail.current?.closest<HTMLElement>("[data-signal-site]");
    if (host) host.dataset.motionPaused = String(next);
    try {
      localStorage.setItem("portfolio-lower-motion", next ? "paused" : "running");
    } catch {}
    document.dispatchEvent(new Event("portfolio-motion-change"));
  };
  return (
    <>
      <aside ref={rail} className={styles.rail} aria-label="Page sections">
        {sections.map(([id, label]) => (
          <a href={`#${id}`} key={id}>
            <i />
            <span>{label}</span>
          </a>
        ))}
      </aside>
      <div className={styles.motionControl}>
        <span>SIGNAL PATH / PORTFOLIO</span>
        <button
          onClick={toggle}
          aria-pressed={paused}
          aria-label={paused ? "Resume section animations" : "Pause section animations"}
        >
          {paused ? <Play size={12} /> : <Pause size={12} />}
          <span>{paused ? "Motion paused" : "Pause motion"}</span>
        </button>
      </div>
    </>
  );
}
