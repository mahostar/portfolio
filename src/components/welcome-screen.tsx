"use client";

import { useEffect, useId, useRef } from "react";
import { usePathname } from "next/navigation";
import type {} from "@/lib/welcome-policy";
import styles from "./welcome-screen.module.css";

export function WelcomeScreen({ name }: { name: string }) {
  const pathname = usePathname();
  const screen = useRef<HTMLDivElement>(null);
  const dot = useRef<SVGCircleElement>(null);
  const aperture = useRef<SVGCircleElement>(null);
  const ring = useRef<SVGCircleElement>(null);
  const skip = useRef<HTMLButtonElement>(null);
  const dismiss = useRef<() => void>(() => {});
  const maskId = useId().replace(/:/g, "");

  useEffect(() => {
    const element = screen.current;
    const boot = window.__portfolioWelcome;
    const root = document.documentElement;
    if (pathname !== "/") {
      if (boot) boot.state = "retired";
      delete root.dataset.welcome;
      return;
    }
    if (!element || !boot || boot.initialPath !== "/" || boot.state !== "armed") return;
    boot.state = "playing";
    const generation = ++boot.generation;
    const apertureNode = aperture.current;
    const ringNode = ring.current;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const previousFocus = document.activeElement as HTMLElement | null;
    const background = [...document.querySelectorAll<HTMLElement>(".site-header, #main, .site-footer, .bottom-nav, .skip-link")];
    const previousInert = background.map((node) => node.inert);
    background.forEach((node) => { node.inert = true; });
    root.dataset.welcome = "playing";
    element.dataset.phase = "greeting";
    element.setAttribute("aria-hidden", "false");
    skip.current?.focus({ preventScroll: true });

    let disposed = false;
    let finished = false;
    let exiting = false;
    let frame = 0;
    let fade: Animation | undefined;
    let restored = false;
    const restore = () => {
      if (restored) return;
      restored = true;
      background.forEach((node, index) => { node.inert = previousInert[index]; });
      delete root.dataset.welcome;
      element.setAttribute("aria-hidden", "true");
      delete element.dataset.phase;
    };
    const finish = (restoreFocus = true) => {
      if (disposed || finished || boot.generation !== generation) return;
      finished = true;
      boot.state = "retired";
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
      window.clearTimeout(safety);
      dismiss.current = () => {};
      removeListeners();
      restore();
      if (restoreFocus && element.contains(document.activeElement)) {
        document.getElementById("main")?.focus({ preventScroll: true });
      }
    };
    const exit = (immediate = false) => {
      if (finished || disposed) return;
      if (exiting) { finish(); return; }
      exiting = true;
      element.dataset.phase = "reveal";
      if (immediate || reduced.matches || !dot.current || !aperture.current || !ring.current) {
        fade = element.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, fill: "forwards" });
        fade.finished.then(() => finish()).catch(() => {});
        return;
      }

      // Open the blue backdrop from the exact location of the yellow period.
      const bounds = element.getBoundingClientRect();
      const point = dot.current.getBoundingClientRect();
      // Convert viewport pixels to SVG units, including the site's QHD zoom.
      const scaleX = element.clientWidth / bounds.width;
      const scaleY = element.clientHeight / bounds.height;
      const x = (point.left + point.width / 2 - bounds.left) * scaleX;
      const y = (point.top + point.height / 2 - bounds.top) * scaleY;
      const radius = Math.hypot(Math.max(x, element.clientWidth - x), Math.max(y, element.clientHeight - y)) + 20;
      const initial = point.width / 2 * scaleX;
      for (const circle of [aperture.current, ring.current]) {
        circle.setAttribute("cx", String(x));
        circle.setAttribute("cy", String(y));
      }
      const start = performance.now();
      const reveal = (now: number) => {
        if (disposed || finished) return;
        const progress = Math.min(1, (now - start) / 1100);
        const eased = 1 - Math.pow(1 - progress, 3);
        const size = initial + (radius - initial) * eased;
        aperture.current?.setAttribute("r", String(size));
        ring.current?.setAttribute("r", String(size));
        ring.current?.setAttribute("stroke-width", String(12 * (1 - progress)));
        ring.current?.setAttribute("opacity", String(1 - progress));
        if (progress < 1) frame = requestAnimationFrame(reveal);
        else finish();
      };
      frame = requestAnimationFrame(reveal);
    };
    dismiss.current = () => exit(true);
    const timer = window.setTimeout(() => exit(), reduced.matches ? 1100 : 4250);
    const safety = window.setTimeout(() => finish(), 7500);
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); exit(true); }
    };
    const change = () => { if (reduced.matches) exit(true); };
    const suspend = () => finish(false);
    // History changes the URL before the router commits. A rapid Back/Forward
    // pair must still retire an interrupted intro even if React batches routes.
    const navigate = () => {
      if (location.pathname !== boot.initialPath) finish(false);
    };
    const resume = (event: PageTransitionEvent) => {
      if (event.persisted) finish(false);
    };
    const removeListeners = () => {
      window.removeEventListener("keydown", escape);
      window.removeEventListener("pagehide", suspend);
      window.removeEventListener("pageshow", resume);
      window.removeEventListener("popstate", navigate);
      reduced.removeEventListener("change", change);
    };
    window.addEventListener("keydown", escape);
    window.addEventListener("pagehide", suspend);
    window.addEventListener("pageshow", resume);
    window.addEventListener("popstate", navigate);
    reduced.addEventListener("change", change);
    return () => {
      disposed = true;
      window.clearTimeout(timer);
      window.clearTimeout(safety);
      cancelAnimationFrame(frame);
      fade?.cancel();
      removeListeners();
      dismiss.current = () => {};
      restore();
      // Strict Mode may clean up and immediately set up this same startup.
      // A real departure or completed intro permanently retires the document.
      if (boot.generation === generation && boot.state === "playing") {
        boot.state = location.pathname === boot.initialPath ? "armed" : "retired";
      }
      apertureNode?.setAttribute("r", "0");
      ringNode?.setAttribute("r", "0");
      if (location.pathname === boot.initialPath && element.contains(document.activeElement) && previousFocus?.isConnected) {
        previousFocus.focus({ preventScroll: true });
      }
    };
  }, [pathname]);

  return (
    <div ref={screen} className={styles.screen} data-welcome-screen role="dialog" aria-modal="true" aria-labelledby="welcome-title" aria-describedby="welcome-subtitle" aria-hidden="true">
      <svg className={styles.backdrop} aria-hidden="true" width="100%" height="100%">
        <defs>
          <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%">
            <rect width="100%" height="100%" fill="white" />
            <circle ref={aperture} r="0" fill="black" />
          </mask>
          <radialGradient id={`${maskId}-blue`} cx="60%" cy="35%" r="80%">
            <stop offset="0%" stopColor="#1454ed" />
            <stop offset="65%" stopColor="#0139b4" />
            <stop offset="100%" stopColor="#002a8b" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${maskId}-blue)`} mask={`url(#${maskId})`} />
        <circle ref={ring} r="0" fill="none" stroke="#ffd400" strokeWidth="0" />
      </svg>
      <div className={styles.artwork} aria-hidden="true">
        <div className={styles.grid} />
        <div className={styles.orbit}><span /></div>
        <div className={styles.outerOrbit} />
        <span className={`${styles.cross} ${styles.crossOne}`} />
        <span className={`${styles.cross} ${styles.crossTwo}`} />
        <svg className={styles.spark} viewBox="0 0 80 80"><path d="M40 0 46 28 68 12 52 34 80 40 52 46 68 68 46 52 40 80 34 52 12 68 28 46 0 40 28 34 12 12 34 28Z" fill="currentColor" /></svg>
      </div>
      <div className={styles.topline}><span>{name}</span><span className={styles.edition}>A little introduction</span></div>
      <div className={styles.center}>
        <p className={styles.kicker}><span /> Glad you’re here</p>
        <svg id="welcome-title" className={styles.handwriting} viewBox="0 0 340 245" role="img" aria-label="Hi.">
          <g fill="none" stroke="white" strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round">
            <path className={`${styles.penStroke} ${styles.firstStroke}`} pathLength="1" d="M 56,195 C 73,166 91,103 102,59 C 114,13 83,17 67,47 C 49,81 62,114 103,99" />
            <path className={`${styles.penStroke} ${styles.crossStroke}`} pathLength="1" d="M 73,135 C 108,115 139,110 171,118" />
            <path className={`${styles.penStroke} ${styles.secondStroke}`} pathLength="1" d="M 166,64 C 184,14 198,21 181,72 L 151,169 C 137,214 167,212 190,182 C 200,169 210,148 218,131" />
            <path className={`${styles.penStroke} ${styles.thirdStroke}`} pathLength="1" d="M 218,131 L 204,174 C 193,209 217,208 261,170" />
            <path className={`${styles.penStroke} ${styles.iDot}`} pathLength="1" d="M 228,102 L 230,96" strokeWidth="9" />
          </g>
          <circle ref={dot} className={styles.dot} cx="287" cy="193" r="10" fill="#ffd400" />
        </svg>
        <div className={styles.subtitleClip}><p id="welcome-subtitle" className={styles.subtitle}>Welcome to my portfolio</p></div>
        <p className={styles.note}>From a spark to something real.</p>
      </div>
      <div className={styles.bottomline}>
        <div className={styles.sequence} aria-hidden="true"><span className={styles.track}><span /></span><span>Let’s begin</span></div>
        <button ref={skip} type="button" className={styles.skip} onClick={() => dismiss.current()}>Skip intro <span aria-hidden="true">↗</span></button>
      </div>
    </div>
  );
}
