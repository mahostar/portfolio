"use client";

import { useEffect, useRef, type ComponentProps, type ReactNode, type RefObject } from "react";
import type { LiquidGlass } from "../../vendor/liquidglass/dist/index.js";
import styles from "./liquid-glass.module.css";
import { HomeLink } from "./home-link";
import { GoldenButtonShader } from "./golden-button-shader";
import { GlassPanelLighting } from "./glass-panel-lighting";
import { getGlassSettings, initializeGlassSettings, subscribeGlassSettings } from "./glass-settings";

function useLocalGlass(root: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const host = root.current;
    const surface = host?.querySelector<HTMLElement>("[data-glass-surface]");
    const background = host?.querySelector<HTMLCanvasElement>("[data-glass-background]");
    if (!host || !surface || !background) return;
    let instance: LiquidGlass | null = null;
    let visible = false;
    let pending = false;
    let disposed = false;
    let failed = false;
    const configure = () => {
      const material = getGlassSettings().panel;
      surface.dataset.config = JSON.stringify({
        blurAmount: material.blur, cornerRadius: 22, zRadius: material.bevel,
        refraction: material.refraction, chromAberration: .015,
        edgeHighlight: material.edgeHighlight, specular: material.specular,
        fresnel: material.fresnel, opacity: material.opacity,
        brightness: material.brightness, shadowOpacity: .15, shadowSpread: 6,
        button: false, floating: false,
      });
    };
    initializeGlassSettings();
    configure();
    const unsubscribe = subscribeGlassSettings(configure);

    const draw = () => {
      const width = host.clientWidth;
      const height = host.clientHeight;
      if (!width || !height) return;
      const ratio = Math.min(devicePixelRatio || 1, 2);
      background.width = Math.round(width * ratio);
      background.height = Math.round(height * ratio);
      const context = background.getContext("2d");
      if (!context) return;
      context.scale(ratio, ratio);
      context.fillStyle = "#10234c";
      context.fillRect(0, 0, width, height);
      instance?.markChanged(background);
    };

    const stop = () => {
      instance?.destroy();
      instance = null;
      host.dataset.glassStatus = "idle";
    };
    const start = async () => {
      if (disposed || !visible || pending || instance || failed || document.hidden) return;
      pending = true;
      try {
        const { LiquidGlass: Glass } = await import("../../vendor/liquidglass/dist/index.js");
        if (disposed || !visible) return;
        configure();
        const created = await Glass.init({ root: host, glassElements: [surface] });
        if (disposed || !visible || document.hidden) created.destroy();
        else {
          instance = created;
          host.dataset.glassStatus = "ready";
        }
      } catch (error) {
        failed = true;
        host.dataset.glassStatus = "fallback";
        console.warn("Local glass rendering unavailable; using the styled surface.", error);
      } finally {
        pending = false;
        if (visible && !instance && !failed && !disposed && !document.hidden) void start();
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) void start();
      else stop();
    }, { rootMargin: "80px" });
    const resize = new ResizeObserver(draw);
    const visibility = () => {
      if (document.hidden) stop();
      else if (visible) void start();
    };
    draw();
    resize.observe(host);
    observer.observe(host);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      disposed = true;
      unsubscribe();
      observer.disconnect();
      resize.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      stop();
    };
  }, [root]);
}

export function LiquidGlassLink({ children, className = "", ...props }: ComponentProps<typeof HomeLink>) {
  return (
    <div className={styles.linkScene} data-local-glass="golden-link">
      <GoldenButtonShader />
      <HomeLink {...props} className={`${className} ${styles.goldenSurface}`} data-gold-surface>
        <span className={styles.buttonContent}>{children}</span>
      </HomeLink>
    </div>
  );
}

export function LiquidGlassPanel({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useLocalGlass(root);
  return (
    <div ref={root} className={styles.panel} data-local-glass="panel">
      <canvas className={styles.background} data-glass-background aria-hidden="true" />
      <div className={styles.surface} data-glass-surface aria-hidden="true" />
      <GlassPanelLighting />
      <div className={styles.content}>{children}</div>
    </div>
  );
}

export function LiquidGlassButton({ children, className = "", ...props }: ComponentProps<"button">) {
  return (
    <div className={styles.buttonScene} data-local-glass="button">
      <GoldenButtonShader />
      <button {...props} className={`${className} ${styles.goldenSurface} ${styles.button}`} data-gold-surface>
        <span className={styles.buttonContent}>{children}</span>
      </button>
    </div>
  );
}
