"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { heroAnchors } from "@/content/site";
import { heroRoutes, cropRoute } from "@/content/hero-paths";
import imageSizes from "@/content/hero-meta.generated.json";
import { coverPoint } from "@/lib/cover-point";
import { motionAllowed } from "@/lib/motion";
import { usePointerField, type PointerFrame } from "@/lib/use-pointer-field";

export type HeroProof = {
  anchor: "io" | "ai" | "pcb" | "robotics";
  label: string;
  text: string;
  href?: string;
};

export function HeroStage({
  background,
  portrait,
  copy,
  bottom,
  proofs,
}: {
  background: ReactNode;
  portrait: ReactNode;
  copy: ReactNode;
  bottom: ReactNode;
  proofs: HeroProof[];
}) {
  const stage = useRef<HTMLDivElement>(null);
  const artwork = useRef<HTMLDivElement>(null);
  const name = useRef<{ element: HTMLElement; x: number; y: number } | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const [pulse, setPulse] = useState({ anchor: "", run: 0 });
  const onFrame = useCallback((frame: PointerFrame) => {
    const cached = name.current;
    if (!cached) return;
    cached.element.style.setProperty("--name-light-x", `${frame.x - cached.x}px`);
    cached.element.style.setProperty("--name-light-y", `${frame.y - cached.y}px`);
  }, []);
  usePointerField(stage, onFrame);

  useEffect(() => {
    const root = stage.current,
      art = artwork.current;
    if (!root || !art) return;
    const mobile = matchMedia("(max-width: 1023px)");
    let disposed = false;
    const measure = () => {
      if (disposed) return;
      const region = root.querySelector<HTMLElement>(".portrait-region")!;
      root.style.setProperty("--art-y", mobile.matches ? `${region.offsetTop}px` : "0px");
      root.style.setProperty("--art-h", `${Math.min(400, root.clientWidth * 0.64)}px`);
      const crop = mobile.matches ? "mobile" : "desktop";
      for (const [id, anchor] of Object.entries(heroAnchors[crop])) {
        const point = coverPoint(
          anchor.u,
          anchor.v,
          { w: art.clientWidth, h: art.clientHeight },
          imageSizes[crop],
        );
        art.style.setProperty(`--${id}-x`, `${point.x}px`);
        art.style.setProperty(`--${id}-y`, `${point.y}px`);
      }
      const outline = root.querySelector<HTMLElement>(".name-outline");
      if (outline) {
        const box = root.getBoundingClientRect(),
          text = outline.getBoundingClientRect();
        name.current = {
          element: outline,
          x: text.left - box.left,
          y: text.top - box.top,
        };
      }
    };
    const resize = new ResizeObserver(measure);
    resize.observe(root);
    resize.observe(art);
    mobile.addEventListener("change", measure);
    measure();
    document.fonts.ready.then(measure);
    return () => {
      disposed = true;
      resize.disconnect();
      mobile.removeEventListener("change", measure);
    };
  }, []);

  // Preserve the existing container-fit name, including Archivo's width axis.
  useEffect(() => {
    const root = stage.current,
      copy = root?.querySelector<HTMLElement>(".hero-copy"),
      heading = copy?.querySelector("h1");
    if (!copy || !heading) return;
    const context = document.createElement("canvas").getContext("2d");
    if (!context) return;
    let disposed = false,
      previous = 0;
    const fit = () => {
      if (disposed || previous === copy.clientWidth) return;
      previous = copy.clientWidth;
      copy.style.setProperty("--name-fit", "1");
      const longest = Math.max(
        ...[...heading.children].map((line) => {
          const style = getComputedStyle(line),
            raw = line.textContent || "";
          context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
          context.fontStretch = "expanded";
          return (
            context.measureText(raw.toUpperCase()).width +
            (parseFloat(style.letterSpacing) || 0) * Math.max(0, raw.length - 1) +
            (parseFloat(style.wordSpacing) || 0) * (raw.split(" ").length - 1)
          );
        }),
      );
      copy.style.setProperty(
        "--name-fit",
        String(Math.min(1, (copy.clientWidth - 4) / longest)),
      );
    };
    const observer = new ResizeObserver(fit);
    observer.observe(copy);
    fit();
    document.fonts.ready.then(() => {
      previous = 0;
      fit();
    });
    return () => {
      disposed = true;
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const root = stage.current;
    if (!root || !motionAllowed()) return;
    let seen = false;
    try {
      seen = sessionStorage.getItem("signal-path-intro") === "seen";
    } catch {
      /* Optional storage. */
    }
    if (seen) return;
    root.dataset.intro = "run";
    const stats = [...root.querySelectorAll<HTMLElement>("[data-count]")];
    let frame = 0,
      start = 0,
      finished = false;
    const finish = () => {
      finished = true;
      cancelAnimationFrame(frame);
      stats.forEach((element) => {
        element.textContent = element.dataset.count || "";
      });
      delete root.dataset.intro;
      try {
        sessionStorage.setItem("signal-path-intro", "seen");
      } catch {
        /* Optional storage. */
      }
    };
    const count = (time: number) => {
      if (!motionAllowed() || document.hidden) {
        finish();
        return;
      }
      start ||= time;
      const progress = Math.min(1, (time - start) / 450),
        eased = 1 - Math.pow(1 - progress, 4);
      stats.forEach((element) => {
        element.textContent = String(Math.round(Number(element.dataset.count) * eased));
      });
      if (progress < 1) frame = requestAnimationFrame(count);
      else finish();
    };
    const timer = setTimeout(() => {
      if (!finished && motionAllowed()) frame = requestAnimationFrame(count);
      else finish();
    }, 1100);
    const paused = new MutationObserver(() => {
      if (!motionAllowed()) finish();
    });
    paused.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-motion"],
    });
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
      paused.disconnect();
    };
  }, []);

  const activate = (anchor: string) => {
    setActive(anchor);
    if (motionAllowed()) setPulse((value) => ({ anchor, run: value.run + 1 }));
  };
  return (
    <div ref={stage} className="hero-scene" data-visible="true">
      <div className="container hero-inner">
        {copy}
        <div className="portrait-region">
          <div ref={artwork} className="hero-art-frame">
            <div className="hero-background">{background}</div>
            <div className="hero-color-wash" />
            <div className="hero-traces" aria-hidden="true">
              <span className="trace-light" />
              <span className="trace-sweep" />
            </div>
            {(["desktop", "mobile"] as const).map((crop) => (
              <svg
                key={crop}
                className={`hero-pulses pulses-${crop}`}
                viewBox={`0 0 ${imageSizes[crop].w} ${imageSizes[crop].h}`}
                preserveAspectRatio="xMaxYMid slice"
                aria-hidden="true"
              >
                {heroRoutes.map((route, index) => (
                  <g
                    key={`${route.id}-${pulse.anchor === route.anchor ? pulse.run : 0}`}
                    data-route={route.anchor}
                    data-run={pulse.anchor === route.anchor ? true : undefined}
                    style={
                      {
                        "--delay": `${0.5 + index * 0.055}s`,
                        "--dur": ".65s",
                      } as CSSProperties
                    }
                  >
                    <path
                      className="pulse-glow"
                      d={crop === "mobile" ? cropRoute(route.d, 960) : route.d}
                      pathLength="100"
                    />
                    <path
                      className="pulse"
                      d={crop === "mobile" ? cropRoute(route.d, 960) : route.d}
                      pathLength="100"
                    />
                  </g>
                ))}
              </svg>
            ))}
            <div className="hero-veil" aria-hidden="true" />
            <div className="stickers">
              {proofs.map((proof, index) => (
                <div
                  key={proof.anchor}
                  className="sticker"
                  data-anchor={proof.anchor}
                  data-active={active === proof.anchor}
                  style={
                    {
                      left: `var(--${proof.anchor}-x, calc(100cqw - var(--cover-w) + var(--u) * var(--cover-w)))`,
                      top: `var(--${proof.anchor}-y, calc((100cqh - var(--cover-h)) * .5 + var(--v) * var(--cover-h)))`,
                      "--du": heroAnchors.desktop[proof.anchor].u,
                      "--dv": heroAnchors.desktop[proof.anchor].v,
                      "--mu": heroAnchors.mobile[proof.anchor].u,
                      "--mv": heroAnchors.mobile[proof.anchor].v,
                      "--arrival": `${1.15 + index * 0.055}s`,
                    } as CSSProperties
                  }
                  onPointerLeave={() => setActive(null)}
                  onBlur={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget))
                      setActive(null);
                  }}
                >
                  <span className="anchor-dot" aria-hidden="true" />
                  <button
                    type="button"
                    aria-describedby={`proof-${proof.anchor}`}
                    aria-expanded={active === proof.anchor}
                    onPointerEnter={(event) => {
                      if (event.pointerType !== "touch") activate(proof.anchor);
                    }}
                    onFocus={() => activate(proof.anchor)}
                    onClick={() => activate(proof.anchor)}
                  >
                    {proof.label}
                    <span className="signal-node" aria-hidden="true" />
                  </button>
                  <span
                    id={`proof-${proof.anchor}`}
                    className="sticker-proof"
                    hidden={active !== proof.anchor}
                  >
                    {proof.href ? <a href={proof.href}>{proof.text}</a> : proof.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="portrait-glow" aria-hidden="true" />
          <div className="portrait">{portrait}</div>
        </div>
        {bottom}
      </div>
    </div>
  );
}
