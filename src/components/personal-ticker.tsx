"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import styles from "./personal-ticker.module.css";

export function PersonalTicker({ phrases }: { phrases: string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let visible = true;
    const sync = () => {
      element.dataset.visible = String(visible && !document.hidden);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    observer.observe(element);
    document.addEventListener("visibilitychange", sync);
    sync();
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);
  return (
    <div
      ref={ref}
      className={styles["personal-ticker"]}
      data-paused={paused}
      role="region"
      aria-label="A little about Mohamed Wassim"
    >
      <div className={styles["ticker-window"]}>
        <div className={styles["ticker-track"]}>
          {[0, 1].map((copy) => (
            <div
              key={copy}
              className={styles["ticker-group"]}
              aria-hidden={copy === 1 ? true : undefined}
            >
              {phrases.map((phrase, index) => (
                <span className={styles["ticker-item"]} key={`${index}-${phrase}`}>
                  <span>{phrase}</span>
                  <svg aria-hidden="true" viewBox="0 0 20 20" width="16" height="16">
                    <path
                      d="M10 1v18M1 10h18M4 4l12 12M4 16 16 4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    />
                  </svg>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
      <button
        className={styles["ticker-toggle"]}
        type="button"
        onClick={() => setPaused((value) => !value)}
        aria-label={paused ? "Resume scrolling text" : "Pause scrolling text"}
        aria-pressed={paused}
      >
        {paused ? (
          <Play size={14} fill="currentColor" />
        ) : (
          <Pause size={14} fill="currentColor" />
        )}
      </button>
    </div>
  );
}
