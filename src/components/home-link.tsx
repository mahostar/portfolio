"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

type Props = Omit<ComponentProps<typeof Link>, "href"> & { href: string };

export function HomeLink({ href, onClick, ...props }: Props) {
  return (
    <Link
      {...props}
      href={href}
      onClick={(event) => {
        onClick?.(event);
        if (
          event.defaultPrevented || event.button !== 0 ||
          event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ||
          (event.currentTarget.target && event.currentTarget.target !== "_self")
        ) return;

        const destination = new URL(href, window.location.href);
        if (
          destination.origin !== window.location.origin ||
          destination.pathname !== window.location.pathname ||
          !destination.hash
        ) return;

        const target = document.getElementById(decodeURIComponent(destination.hash.slice(1)));
        if (!target) return;

        // Scroll explicitly even when the current URL already has this hash.
        event.preventDefault();
        if (destination.href !== window.location.href) {
          window.history.pushState(window.history.state, "", destination.href);
        }
        const headerHeight = document.querySelector<HTMLElement>(".site-header")?.offsetHeight || 0;
        const top = destination.hash === "#home" ? 0 : window.scrollY + target.getBoundingClientRect().top - headerHeight - 12;
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({
          top: Math.max(0, top),
          left: 0,
          behavior: reduceMotion ? "instant" : "smooth",
        });
      }}
    />
  );
}
