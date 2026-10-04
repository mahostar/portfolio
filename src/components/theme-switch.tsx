"use client";

import { useRef, useState } from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun, Check } from "lucide-react";
import { LiquidGlassButton } from "./liquid-glass";

const options = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "system", label: "Device setting", Icon: Monitor },
];

export function ThemeSwitch() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  return (
    <div
      className="theme-control"
      ref={root}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setOpen(false);
          root.current?.querySelector<HTMLButtonElement>(".theme-switch")?.focus();
        }
      }}
    >
      <LiquidGlassButton
        type="button"
        className="theme-switch"
        aria-label="Change color theme"
        aria-expanded={open}
        aria-controls="theme-options"
        onClick={() => setOpen(!open)}
      >
        <Sun className="theme-sun" size={22} aria-hidden="true" />
        <Moon className="theme-moon" size={22} aria-hidden="true" />
      </LiquidGlassButton>
      {open && (
        <div
          id="theme-options"
          className="theme-options"
          role="group"
          aria-label="Color theme"
        >
          {options.map(({ value, label, Icon }) => (
            <button
              type="button"
              key={value}
              aria-pressed={theme === value}
              onClick={() => {
                setTheme(value);
                setOpen(false);
                root.current?.querySelector<HTMLButtonElement>(".theme-switch")?.focus();
              }}
            >
              <Icon size={18} aria-hidden="true" />
              <span>{label}</span>
              {theme === value && <Check size={16} aria-hidden="true" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
