"use client";

import { useSyncExternalStore } from "react";

function subscribe(update: () => void) {
  const timer = window.setInterval(update, 60_000);
  window.addEventListener("focus", update);
  document.addEventListener("visibilitychange", update);
  return () => {
    window.clearInterval(timer);
    window.removeEventListener("focus", update);
    document.removeEventListener("visibilitychange", update);
  };
}
const getYear = () => new Date().getFullYear();
const getServerYear = () => null;

export function CopyrightYear() {
  const year = useSyncExternalStore<number | null>(subscribe, getYear, getServerYear);
  return <span data-copyright-year>{year}</span>;
}
