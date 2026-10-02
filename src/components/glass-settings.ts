export type GlassLight = { x: number; y: number; z: number; intensity: number; color: string };
export type GlassMaterial = {
  intensity: number; sharpness: number; bloom: number; rim: number; fresnel: number;
  bevel: number; depth: number; pointerResponse: number; glow: number; color: string;
  ambient: number; diffuse1: number; diffuse2: number; opacity: number;
  brightness: number; blur: number; refraction: number; specular: number;
  edgeHighlight: number; lights: GlassLight[];
};
export type GlassSettings = { buttons: GlassMaterial; panel: GlassMaterial };
export type GlassGroup = keyof GlassSettings;
export type GlassNumberKey = { [K in keyof GlassMaterial]: GlassMaterial[K] extends number ? K : never }[keyof GlassMaterial];

export const GLASS_DEFAULTS: GlassSettings = {
  buttons: {
    intensity: .85, sharpness: 133, bloom: .05, rim: .08, fresnel: .87,
    bevel: 10, depth: 9, pointerResponse: 2, glow: 1, color: "#e8c321",
    ambient: .65, diffuse1: .32, diffuse2: .19, opacity: 1,
    brightness: 0, blur: 0, refraction: 0, specular: .73, edgeHighlight: 0,
    lights: [
      { x: -240, y: 330, z: 600, intensity: 1, color: "#fffbe8" },
      { x: 270, y: -320, z: 600, intensity: 1, color: "#fffbe8" },
    ],
  },
  panel: {
    intensity: .23, sharpness: 80, bloom: 0, rim: 0, fresnel: 0,
    bevel: 10.9, depth: .32, pointerResponse: 1.15, glow: 0, color: "#10234c",
    ambient: 0, diffuse1: 0, diffuse2: 0, opacity: .61,
    brightness: .22, blur: .31, refraction: .28, specular: .22, edgeHighlight: .35,
    lights: [
      { x: -2.7, y: 3.3, z: 6.35, intensity: 1.65, color: "#7ad9ff" },
      { x: 3.25, y: 0, z: 4.15, intensity: .95, color: "#ffedbf" },
      { x: -2.15, y: -1.95, z: 3.9, intensity: .95, color: "#a891ff" },
      { x: 1, y: -4.3, z: 4, intensity: .55, color: "#52bfff" },
    ],
  },
};

const defaultsVersion = "v2";
const storageKey = `portfolio-glass-settings-${defaultsVersion}`;
type SettingsStore = { settings: GlassSettings; initialized: boolean; listeners: Set<() => void>; version?: string };
// Keep the exact same listener registry across Fast Refresh module replacement.
const runtime = globalThis as typeof globalThis & { __portfolioGlassStore?: SettingsStore };
const store: SettingsStore = typeof window === "undefined"
  ? { settings: GLASS_DEFAULTS, initialized: false, listeners: new Set(), version: defaultsVersion }
  : (runtime.__portfolioGlassStore ??= { settings: GLASS_DEFAULTS, initialized: false, listeners: new Set(), version: defaultsVersion });
if (store.version !== defaultsVersion) {
  store.settings = GLASS_DEFAULTS;
  store.initialized = false;
  store.version = defaultsVersion;
  queueMicrotask(() => store.listeners.forEach(listener => listener()));
}
export const getGlassSettings = () => store.settings;
export const getServerGlassSettings = () => GLASS_DEFAULTS;
export function subscribeGlassSettings(listener: () => void) {
  store.listeners.add(listener);
  return () => { store.listeners.delete(listener); };
}
export function initializeGlassSettings() {
  if (store.initialized || typeof window === "undefined") return;
  store.initialized = true;
  if (process.env.NODE_ENV !== "development") return;
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "null") as GlassSettings | null;
    if (saved) {
      const next = structuredClone(GLASS_DEFAULTS);
      for (const group of ["buttons", "panel"] as const) {
        const input = saved[group];
        if (!input) continue;
        for (const key of Object.keys(next[group]) as (keyof GlassMaterial)[]) {
          const value = input[key];
          if (key === "lights") {
            if (Array.isArray(value) && value.length === next[group].lights.length) {
              next[group].lights = value.map((light, i) => ({
                x: Number.isFinite(light.x) ? Math.max(-1200, Math.min(1200, light.x)) : next[group].lights[i].x,
                y: Number.isFinite(light.y) ? Math.max(-1200, Math.min(1200, light.y)) : next[group].lights[i].y,
                z: Number.isFinite(light.z) ? Math.max(.5, Math.min(1200, light.z)) : next[group].lights[i].z,
                intensity: Number.isFinite(light.intensity) ? Math.max(0, Math.min(3, light.intensity)) : 1,
                color: /^#[0-9a-f]{6}$/i.test(light.color) ? light.color : next[group].lights[i].color,
              }));
            }
          } else if (key === "color") {
            if (typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value)) next[group].color = value;
          } else if (typeof value === "number" && Number.isFinite(value)) {
            next[group][key] = Math.max(0, Math.min(500, value));
          }
        }
      }
      store.settings = next;
      store.listeners.forEach(listener => listener());
    }
  } catch { /* Invalid or unavailable storage keeps the working defaults. */ }
}
export function setGlassMaterial(group: GlassGroup, patch: Partial<GlassMaterial>) {
  store.settings = { ...store.settings, [group]: { ...store.settings[group], ...patch } };
  store.listeners.forEach(listener => listener());
  try { localStorage.setItem(storageKey, JSON.stringify(store.settings)); } catch { /* Live controls still work without storage. */ }
}
export function resetGlassMaterial(group: GlassGroup) {
  setGlassMaterial(group, structuredClone(GLASS_DEFAULTS[group]));
}
export function colorToRgb(hex: string): [number, number, number] {
  return [1, 3, 5].map(offset => parseInt(hex.slice(offset, offset + 2), 16) / 255) as [number, number, number];
}
