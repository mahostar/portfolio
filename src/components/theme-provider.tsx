"use client";

import { ThemeProvider as BrowserThemeProvider } from "next-themes";
import type { ReactNode } from "react";

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <BrowserThemeProvider
      attribute="data-theme"
      defaultTheme="system"
      enableSystem
      storageKey="portfolio-theme"
      disableTransitionOnChange
    >
      {children}
    </BrowserThemeProvider>
  );
}
