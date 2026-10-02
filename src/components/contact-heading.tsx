"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./signal-portfolio.module.css";

export function ContactHeading() {
  const heading = useRef<HTMLHeadingElement>(null);
  const measure = useRef<HTMLSpanElement>(null);
  const [fits, setFits] = useState(false);

  useEffect(() => {
    const element = heading.current;
    const text = measure.current;
    if (!element || !text) return;
    const update = () => setFits(text.getBoundingClientRect().width <= element.clientWidth);
    const observer = new ResizeObserver(update);
    observer.observe(element);
    observer.observe(text);
    update();
    return () => observer.disconnect();
  }, []);

  return (
    <h2 id="contact-heading" ref={heading}>
      {fits ? "Let’s build something" : "Let’s build"}
      <span ref={measure} className={styles.headingMeasure} aria-hidden="true">
        Let’s build something
      </span>
    </h2>
  );
}
