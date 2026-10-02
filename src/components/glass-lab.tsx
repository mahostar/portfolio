"use client";

import { useEffect, useId, useState, useSyncExternalStore } from "react";
import { getGlassSettings, getServerGlassSettings, initializeGlassSettings, resetGlassMaterial, setGlassMaterial, subscribeGlassSettings, type GlassGroup, type GlassNumberKey } from "./glass-settings";
import styles from "./glass-lab.module.css";

type SliderDefinition = [GlassNumberKey, string, number, number, number];
const shared: SliderDefinition[] = [
  ["intensity", "Reflection intensity", 0, 2, .01],
  ["sharpness", "Reflection sharpness", 10, 400, 1],
  ["bloom", "Soft reflections", 0, .5, .01],
  ["rim", "Rim brightness", 0, 1, .01],
  ["fresnel", "Edge reflections", 0, 1, .01],
  ["pointerResponse", "Pointer response", 0, 3, .05],
];
const buttonControls: SliderDefinition[] = [
  ["ambient", "Ambient light", 0, 1.2, .01],
  ["diffuse1", "Light 1 diffuse", 0, .8, .01],
  ["diffuse2", "Light 2 diffuse", 0, .8, .01],
  ["specular", "Specular strength", 0, 2, .01],
  ["bevel", "Bevel width", 2, 20, .1],
  ["depth", "Surface depth", 1, 18, .1],
  ["glow", "Outer glow", 0, 3, .05],
];
const panelControls: SliderDefinition[] = [
  ["opacity", "Glass opacity", 0, 1, .01],
  ["brightness", "Glass brightness", 0, .5, .01],
  ["blur", "Background blur", 0, 1, .01],
  ["refraction", "Refraction", 0, 1, .01],
  ["specular", "Base glass highlights", 0, .8, .01],
  ["edgeHighlight", "Base glass rim", 0, .8, .01],
  ["bevel", "Bevel width", 4, 28, .1],
  ["depth", "Surface curvature", .1, 1, .01],
];

function Slider({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (value: number) => void }) {
  const id = useId();
  return <label className={styles.slider} htmlFor={id}>
    <span>{label}<output>{Number(value.toFixed(2))}</output></span>
    <input id={id} aria-label={label} type="range" min={min} max={max} step={step} value={value} onInput={event => onChange(Number(event.currentTarget.value))} />
  </label>;
}

export function GlassLab() {
  const settings = useSyncExternalStore(subscribeGlassSettings, getGlassSettings, getServerGlassSettings);
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [group, setGroup] = useState<GlassGroup>("panel");
  useEffect(initializeGlassSettings, []);
  const material = settings[group];
  const exportSettings = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(settings, null, 2)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "glass-settings.json";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  if (hidden) return null;
  return <div className={styles.lab}>
    {open && <aside id="glass-lab-controls" className={styles.menu} aria-label="Glass lab controls">
      <header className={styles.header}><div><strong>Glass lab</strong><small>Live shader controls · auto-saved</small></div><button type="button" aria-label="Close glass lab" onClick={() => setOpen(false)}>×</button></header>
      <div className={styles.tabs} role="group" aria-label="Material to edit">
        <button type="button" aria-pressed={group === "panel"} onClick={() => setGroup("panel")}>Contact panel</button>
        <button type="button" aria-pressed={group === "buttons"} onClick={() => setGroup("buttons")}>Yellow buttons</button>
      </div>
      <div className={styles.body}>
        <p>{group === "buttons" ? "One configuration updates Let’s build and Send message together." : "Tune the glass surface and its four reflected lights."}</p>
        {group === "buttons" && <label className={styles.color}>Gold color<input aria-label="Gold color" type="color" value={material.color} onInput={event => setGlassMaterial(group, { color: event.currentTarget.value })} /></label>}
        {[...shared, ...(group === "buttons" ? buttonControls : panelControls)].map(([key, label, min, max, step]) => <Slider key={key} label={label} value={material[key]} min={min} max={max} step={step} onChange={value => setGlassMaterial(group, { [key]: value })} />)}
        {material.lights.map((light, index) => <details className={styles.light} key={index}>
          <summary><i style={{ background: light.color }} />Light {index + 1}<span>{light.intensity.toFixed(2)}</span></summary>
          <label className={styles.color}>Light color<input aria-label={`Light ${index + 1} color`} type="color" value={light.color} onInput={event => setGlassMaterial(group, { lights: material.lights.map((item, i) => i === index ? { ...item, color: event.currentTarget.value } : item) })} /></label>
          {(["intensity", "x", "y", "z"] as const).map(axis => <Slider key={axis} label={`Light ${index + 1} ${axis === "intensity" ? "intensity" : axis.toUpperCase()}`} value={light[axis]} min={axis === "intensity" ? 0 : axis === "z" ? (group === "buttons" ? 100 : .5) : (group === "buttons" ? -800 : -6)} max={axis === "intensity" ? 3 : (group === "buttons" ? (axis === "z" ? 1200 : 800) : (axis === "z" ? 10 : 6))} step={group === "buttons" && axis !== "intensity" ? 5 : .05} onChange={value => setGlassMaterial(group, { lights: material.lights.map((item, i) => i === index ? { ...item, [axis]: value } : item) })} />)}
        </details>)}
      </div>
      <footer className={styles.footer}><button type="button" onClick={() => resetGlassMaterial(group)}>Reset {group === "buttons" ? "buttons" : "panel"}</button><button type="button" onClick={exportSettings}>Export JSON</button><button type="button" onClick={() => setHidden(true)}>Hide until reload</button></footer>
    </aside>}
    <button type="button" className={styles.launcher} aria-expanded={open} aria-controls="glass-lab-controls" onClick={() => setOpen(value => !value)}>◈ Glass lab</button>
  </div>;
}
