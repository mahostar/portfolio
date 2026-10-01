"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Folder, Home, Mail, UserRound, Sparkles } from "lucide-react";
import { NavigationGlass } from "./navigation-glass";
import styles from "./signal-navigation.module.css";

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
    const groups: Record<string, string> = {
      home: "home",
      work: "work",
      about: "about",
      journey: "about",
      interests: "about",
      impact: "impact",
      skills: "impact",
      certificates: "impact",
      contact: "contact",
    };
    const sections = Object.keys(groups)
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => !!element);
    const header = document.querySelector<HTMLElement>(".site-header");
    const bar = document.querySelector<HTMLElement>(".bottom-nav");
    const hero = document.getElementById("home");
    let frame = 0;
    let lastScroll = window.scrollY;
    const observe = () => {
      frame = 0;
      const anchor = window.innerHeight * 0.38;
      const current = sections
        .filter((element) => element.getBoundingClientRect().top <= anchor)
        .at(-1);
      const group = window.scrollY <= 2 ? "home" : groups[current?.id || "home"];
      setSection(group);
      const lower =
        !hero || hero.getBoundingClientRect().bottom <= (header?.offsetHeight || 64);
      if (header) {
        header.dataset.signalLower = String(lower);
        if (Math.abs(scrollY - lastScroll) > 4)
          header.dataset.scrollDirection = scrollY > lastScroll ? "down" : "up";
      }
      if (bar) bar.dataset.signalLower = String(lower);
      lastScroll = scrollY;
      for (const nav of [header?.querySelector<HTMLElement>(".desktop-nav"), bar]) {
        const selected = nav?.querySelector<HTMLAnchorElement>(`a[href="#${group}"]`);
        if (!nav || !selected) continue;
        nav.style.setProperty("--signal-indicator-x", `${selected.offsetLeft}px`);
        nav.style.setProperty("--signal-indicator-width", `${selected.offsetWidth}px`);
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(observe);
    };
    const observer = new ResizeObserver(schedule);
    sections.forEach((element) => observer.observe(element));
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    void document.fonts.ready.then(schedule);
    observe();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [onHome]);
  useEffect(() => {
    if (onHome) return;
    let cancelled = false;
    const measure = () => {
      if (cancelled) return;
      for (const nav of document.querySelectorAll<HTMLElement>(
        ".desktop-nav,.bottom-nav",
      )) {
        const selected = nav.querySelector<HTMLAnchorElement>("a.active");
        if (!selected) continue;
        nav.style.setProperty("--signal-indicator-x", `${selected.offsetLeft}px`);
        nav.style.setProperty("--signal-indicator-width", `${selected.offsetWidth}px`);
      }
    };
    measure();
    void document.fonts.ready.then(measure);
    window.addEventListener("resize", measure, { passive: true });
    return () => {
      cancelled = true;
      window.removeEventListener("resize", measure);
    };
  }, [onHome, active]);
  const href = (id: string) => (onHome ? `#${id}` : `/#${id}`);
  return (
    <>
      <header
        className={`site-header ${styles.header}`}
        data-scroll-state="top"
        data-signal-lower={onHome ? undefined : "true"}
      >
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
                {id === "impact" && active !== "home" ? "Proof" : label}
              </Link>
            ))}
          </nav>
          <Link className="nav-cta" href={href("contact")}>
            Let’s build
            <ArrowRight size={18} />
          </Link>
        </div>
      </header>
      <nav
        className={`bottom-nav ${styles.bottom}`}
        aria-label="Mobile navigation"
        data-signal-lower={onHome ? undefined : "true"}
      >
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
            <span>{id === "impact" && active !== "home" ? "Proof" : label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
