"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Folder, Home, Mail, UserRound } from "lucide-react";

const items = [{ id: "home", label: "Home", Icon: Home }, { id: "work", label: "Work", Icon: Folder }, { id: "about", label: "About", Icon: UserRound }, { id: "contact", label: "Contact", Icon: Mail }];

export function Navigation({ monogram }: { monogram: string }) {
  const pathname = usePathname();
  const onHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [section, setSection] = useState("home");
  const active = onHome ? section : "work";
  useEffect(() => {
    const bar = document.querySelector<HTMLElement>(".bottom-nav");
    const header = document.querySelector<HTMLElement>(".site-header");
    if (!bar || !header) return;
    const measure = () => {
      document.documentElement.style.setProperty("--nav-clearance", `${bar.getBoundingClientRect().height}px`);
      document.documentElement.style.setProperty("--header-clearance", `${header.getBoundingClientRect().height + 16}px`);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(bar); observer.observe(header); measure();
    return () => { observer.disconnect(); };
  }, []);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 80);
    update();
    window.addEventListener("scroll", update, { passive: true });
    if (!onHome) return () => window.removeEventListener("scroll", update);
    const sections = [...document.querySelectorAll<HTMLElement>("main section[id]")];
    const observe = () => {
      const anchor = window.innerHeight * 0.38;
      const current = sections.filter((element) => element.getBoundingClientRect().top <= anchor).at(-1);
      setSection(current ? ["skills", "timeline"].includes(current.id) ? "about" : current.id : "home");
    };
    const observer = new IntersectionObserver(observe, { rootMargin: "-15% 0px -45% 0px", threshold: [0, 0.25, 0.5, 1] });
    sections.forEach((element) => observer.observe(element));
    observe();
    return () => { window.removeEventListener("scroll", update); observer.disconnect(); };
  }, [onHome]);
  const href = (id: string) => onHome ? `#${id}` : `/#${id}`;
  return <>
    <header className={`site-header ${scrolled || !onHome ? "is-solid" : ""}`}>
      <div className="container nav-inner">
        <Link href={href("home")} className="monogram" aria-label={`${monogram} — Go to home`}>{monogram}<span className="monogram-dot" /></Link>
        <nav className="desktop-nav" aria-label="Main navigation">{items.map(({ id, label }) => <Link key={id} href={href(id)} className={active === id ? "active" : ""} aria-current={active === id ? "page" : undefined}>{label}</Link>)}</nav>
        <Link className="nav-cta" href={href("contact")}><ArrowRight size={18} />Let’s build</Link>
      </div>
    </header>
    <nav className="bottom-nav" aria-label="Mobile navigation">{items.map(({ id, label, Icon }) => <Link key={id} href={href(id)} className={active === id ? "active" : ""} aria-current={active === id ? "page" : undefined}><Icon size={22} strokeWidth={1.7} fill={active === id && id === "home" ? "currentColor" : "none"} /><span>{label}</span></Link>)}</nav>
  </>;
}
