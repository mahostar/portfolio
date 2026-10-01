"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Folder, Home, Mail, UserRound, Sparkles } from "lucide-react";
import { NavigationGlass } from "./navigation-glass";

const items = [
  { id: "home", label: "Home", Icon: Home },
  { id: "work", label: "Work", Icon: Folder },
  { id: "about", label: "About", Icon: UserRound },
  { id: "impact", label: "Impact", Icon: Sparkles },
  { id: "contact", label: "Contact", Icon: Mail },
];

export function Navigation({ monogram, name }: { monogram: string; name: string }) {
  const pathname = usePathname();
  const onHome = pathname === "/";
  const [section, setSection] = useState("home");
  const active = onHome ? section : "work";
  useEffect(() => {
    const bar = document.querySelector<HTMLElement>(".bottom-nav");
    const header = document.querySelector<HTMLElement>(".site-header");
    if (!bar || !header) return;
    const measure = () => {
      document.documentElement.style.setProperty(
        "--nav-clearance",
        `${bar.getBoundingClientRect().height}px`,
      );
      document.documentElement.style.setProperty(
        "--header-clearance",
        `${header.getBoundingClientRect().height + 16}px`,
      );
    };
    const observer = new ResizeObserver(measure);
    observer.observe(bar);
    observer.observe(header);
    measure();
    return () => {
      observer.disconnect();
    };
  }, []);
  useEffect(() => {
    if (!onHome) return;
    // Only primary navigation anchors set the active tab. Supporting sections
    // stay within the preceding primary section instead of jumping back to About.
    const sections = items
      .map(({ id }) => document.getElementById(id))
      .filter((element): element is HTMLElement => !!element);
    let frame = 0;
    const observe = () => {
      frame = 0;
      const anchor = window.innerHeight * 0.38;
      const current = sections
        .filter((element) => element.getBoundingClientRect().top <= anchor)
        .at(-1);
      setSection(window.scrollY <= 2 ? "home" : current?.id || "home");
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(observe);
    };
    const observer = new ResizeObserver(schedule);
    sections.forEach((element) => observer.observe(element));
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    observe();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [onHome]);
  const href = (id: string) => (onHome ? `#${id}` : `/#${id}`);
  return (
    <>
      <header className="site-header" data-scroll-state="top">
        <NavigationGlass />
        <div className="container nav-inner">
          <Link
            href={href("home")}
            className="nav-brand"
            aria-label={`${monogram} — Go to home`}
          >
            <span className="monogram">
              {monogram}
              <span className="monogram-dot" />
            </span>
            <span className="nav-brand-name">
              {name}
              <span>Embedded / Edge AI</span>
            </span>
          </Link>
          <nav className="desktop-nav" aria-label="Main navigation">
            {items.map(({ id, label }) => (
              <Link
                key={id}
                href={href(id)}
                className={active === id ? "active" : ""}
                aria-current={active === id ? "page" : undefined}
              >
                {label}
              </Link>
            ))}
          </nav>
          <Link className="nav-cta" href={href("contact")}>
            Let’s build
            <ArrowRight size={18} />
          </Link>
        </div>
      </header>
      <nav className="bottom-nav" aria-label="Mobile navigation">
        {items.map(({ id, label, Icon }) => (
          <Link
            key={id}
            href={href(id)}
            className={active === id ? "active" : ""}
            aria-current={active === id ? "page" : undefined}
          >
            <Icon
              size={22}
              strokeWidth={1.7}
              fill={active === id && id === "home" ? "currentColor" : "none"}
            />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
