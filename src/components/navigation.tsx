"use client";

import { useEffect, useRef, useState } from "react";
import { HomeLink as Link } from "./home-link";
import { usePathname } from "next/navigation";
import { ArrowRight, Folder, Home, Mail, UserRound, Sparkles } from "lucide-react";
import { NavigationGlass } from "./navigation-glass";
import { BlueNavigationBackdrop, BlueNavigationGlass } from "./blue-navigation-glass";
import { BrandLogo } from "./brand-logo";
import { LiquidGlassLink } from "./liquid-glass";
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
  const rowRef = useRef<HTMLDivElement>(null);
  const active = onHome ? section : "work";
  useEffect(() => {
    const row = rowRef.current;
    const brand = row?.querySelector<HTMLElement>(".nav-brand");
    const label = row?.querySelector<HTMLElement>(".nav-brand-name");
    const logo = brand?.firstElementChild;
    if (!row || !brand || !label || !logo) return;

    // The label remains measurable while hidden. Always measure the full layout,
    // so hiding it cannot change the decision and cause a resize feedback loop.
    const measure = () => {
      const siblings = [...row.children].filter(
        (element) => element !== brand && getComputedStyle(element).display !== "none",
      );
      const rowStyle = getComputedStyle(row);
      const required = logo.getBoundingClientRect().width
        + parseFloat(getComputedStyle(brand).columnGap)
        + label.getBoundingClientRect().width
        + siblings.reduce((width, element) => width + element.getBoundingClientRect().width, 0)
        + siblings.length * parseFloat(rowStyle.columnGap);
      const available = row.getBoundingClientRect().width
        - parseFloat(rowStyle.paddingLeft) - parseFloat(rowStyle.paddingRight);
      row.dataset.nameFits = String(required + 1 <= available);
    };
    const observer = new ResizeObserver(measure);
    [row, logo, label, ...row.children].forEach((element) => observer.observe(element));
    measure();
    return () => observer.disconnect();
  }, [name]);
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
    const contact = document.getElementById("contact");
    let frame = 0;
    let lastScroll = window.scrollY;
    const observe = () => {
      frame = 0;
      const anchor = window.innerHeight * 0.38;
      const current = sections
        .filter((element) => element.getBoundingClientRect().top <= anchor)
        .at(-1);
      // A short final section may never reach the anchor on a tall viewport.
      const atEnd =
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 2;
      const group =
        window.scrollY <= 2
          ? "home"
          : atEnd && contact
            ? "contact"
            : groups[current?.id || "home"];
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
  const href = (id: string) => (onHome ? `#${id}` : `/#${id}`);
  return (
    <>
      {onHome && <BlueNavigationBackdrop />}
      <header
        className="site-header"
        data-scroll-state="top"
        data-signal-lower={onHome ? undefined : "true"}
      >
        <NavigationGlass surface={false} />
        <BlueNavigationGlass />
        <div className="container nav-inner" ref={rowRef}>
          <Link
            href={href("home")}
            className="nav-brand"
            aria-label={`${monogram} — Go to home`}
          >
            <BrandLogo />
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
          <LiquidGlassLink className="nav-cta" href={href("contact")}>
            Let’s build
            <ArrowRight size={18} />
          </LiquidGlassLink>
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
              fill="none"
            />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
