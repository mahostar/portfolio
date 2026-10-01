"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { motionAllowed } from "@/lib/motion";
import { reveal } from "@/lib/reveal";

const entranceSelector =
  "[data-reveal],.project-card,.journey-list li,.impact-card,.interest-card,.certificate-card,.skill-group,.story-heading,.section-header,.catalog-heading,.case-heading,.case-body h2,.case-next";
const surfaceSelector =
  ".project-card,.impact-card,.certificate-card,.interest-card,.case-next";

// Content is readable before enhancement. New filtered/streamed cards receive
// the same interactions as the initial page, without reanimating existing cards.
export function PortfolioMotion() {
  const pathname = usePathname();
  useEffect(() => {
    const main = document.getElementById("main");
    if (!main) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    const surfaces = new Map<HTMLElement, () => void>();
    const observed = new Set<HTMLElement>();
    const animations = new Map<Animation, HTMLElement>();
    const enter = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const element = entry.target as HTMLElement;
          if (!entry.isIntersecting) continue;
          enter.unobserve(element);
          if (!motionAllowed()) continue;
          const delay = (Number(element.dataset.motionOrder || 0) % 3) * 65;
          const animation = reveal(element, delay);
          animations.set(animation, element);
          animation.onfinish = () => animations.delete(animation);
        }
      },
      { threshold: 0.06 },
    );

    const registerSurface = (element: HTMLElement) => {
      if (surfaces.has(element)) return;
      let frame = 0;
      const move = (event: PointerEvent) => {
        if (!fine.matches || !motionAllowed()) return;
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          const bounds = element.getBoundingClientRect();
          const x = (event.clientX - bounds.left) / bounds.width;
          const y = (event.clientY - bounds.top) / bounds.height;
          element.style.setProperty("--light-x", `${x * 100}%`);
          element.style.setProperty("--light-y", `${y * 100}%`);
          element.style.setProperty("--image-x", `${(x - 0.5) * 7}px`);
          element.style.setProperty("--image-y", `${(y - 0.5) * 5}px`);
          element.dataset.pointer = "inside";
        });
      };
      const leave = () => {
        cancelAnimationFrame(frame);
        delete element.dataset.pointer;
        element.style.setProperty("--image-x", "0px");
        element.style.setProperty("--image-y", "0px");
      };
      element.addEventListener("pointermove", move, { passive: true });
      element.addEventListener("pointerleave", leave);
      surfaces.set(element, () => {
        leave();
        element.removeEventListener("pointermove", move);
        element.removeEventListener("pointerleave", leave);
      });
    };
    const refresh = () => {
      for (const element of observed)
        if (!element.isConnected) {
          enter.unobserve(element);
          observed.delete(element);
        }
      for (const [element, cleanup] of surfaces)
        if (!element.isConnected) {
          cleanup();
          surfaces.delete(element);
        }
      for (const [animation, element] of animations)
        if (!element.isConnected) {
          animation.cancel();
          animations.delete(animation);
        }
      main.querySelectorAll<HTMLElement>(entranceSelector).forEach((element, index) => {
        if (observed.has(element)) return;
        observed.add(element);
        element.dataset.motionOrder = String(index);
        enter.observe(element);
      });
      main.querySelectorAll<HTMLElement>(surfaceSelector).forEach(registerSurface);
    };

    let scrollFrame = 0;
    let refreshFrame = 0;
    const progress = () => {
      scrollFrame = 0;
      const journey = main.querySelector<HTMLElement>(".journey-list");
      if (journey) {
        const bounds = journey.getBoundingClientRect();
        const value = Math.max(
          0,
          Math.min(1, (innerHeight * 0.62 - bounds.top) / Math.max(1, bounds.height)),
        );
        journey.style.setProperty(
          "--journey-progress",
          reduced.matches ? "1" : String(value),
        );
        journey.querySelectorAll<HTMLElement>("li").forEach((item) => {
          item.dataset.reached = String(
            item.getBoundingClientRect().top < innerHeight * 0.62,
          );
        });
      }
      const headings = [...main.querySelectorAll<HTMLElement>(".case-body h2[id]")];
      if (headings.length) {
        const anchor =
          (document.querySelector(".site-header")?.getBoundingClientRect().bottom || 80) +
          70;
        const current =
          headings
            .filter((heading) => heading.getBoundingClientRect().top <= anchor)
            .at(-1) || headings[0];
        main.querySelectorAll<HTMLAnchorElement>(".case-contents a").forEach((link) => {
          if (link.hash === `#${current.id}`)
            link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
      }
    };
    const schedule = () => {
      if (!scrollFrame) scrollFrame = requestAnimationFrame(progress);
    };
    const mutations = new MutationObserver(() => {
      if (!refreshFrame)
        refreshFrame = requestAnimationFrame(() => {
          refreshFrame = 0;
          refresh();
          schedule();
        });
    });
    const changeMotion = () => {
      if (!motionAllowed()) {
        animations.forEach((_, animation) => animation.cancel());
        animations.clear();
        surfaces.forEach((_, element) => {
          delete element.dataset.pointer;
          element.style.setProperty("--image-x", "0px");
          element.style.setProperty("--image-y", "0px");
        });
      }
      schedule();
    };
    const switchObserver = new MutationObserver(changeMotion);
    switchObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-motion"],
    });
    mutations.observe(main, { childList: true, subtree: true });
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    reduced.addEventListener("change", changeMotion);
    refresh();
    progress();
    return () => {
      switchObserver.disconnect();
      enter.disconnect();
      mutations.disconnect();
      animations.forEach((_, animation) => animation.cancel());
      surfaces.forEach((cleanup) => cleanup());
      cancelAnimationFrame(scrollFrame);
      cancelAnimationFrame(refreshFrame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      reduced.removeEventListener("change", changeMotion);
    };
  }, [pathname]);
  return null;
}
