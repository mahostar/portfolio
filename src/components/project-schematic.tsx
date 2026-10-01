import {
  Activity,
  BrainCircuit,
  Camera,
  Cpu,
  Leaf,
  ScanFace,
  Radio,
  Workflow,
} from "lucide-react";
import type { CSSProperties } from "react";
import styles from "./project-card.module.css";

const motifs = {
  easyshield: Camera,
  plantini: Leaf,
  smarthart: Activity,
  algobrain: BrainCircuit,
  cyclops: Workflow,
  "depthfusion-vit": ScanFace,
  "remote-pc-power": Radio,
  niotoshield: Cpu,
};
export const categoryColors: Record<string, string> = {
  "AI + Edge": "#7fd8ff",
  "IoT + Hardware": "#7cf2c2",
  "AI + IoT": "#ffd400",
  "Electronics + BCI": "#b9a8ff",
  "AI + Agents": "#9bd2ff",
  "IoT + Security": "#7cf2c2",
};

export function ProjectSchematic({
  slug,
  pipeline,
}: {
  slug: string;
  pipeline: string[];
}) {
  const Motif = motifs[slug as keyof typeof motifs] || Cpu;
  return (
    <div className={styles.schematic} aria-hidden="true">
      <div className={styles.artLabels}>
        <span>SYSTEM / {slug.toUpperCase()}</span>
        <span>01 — {String(pipeline.length).padStart(2, "0")}</span>
      </div>
      <div className={styles.diagram}>
        <svg className={styles.traces} viewBox="0 0 600 220" preserveAspectRatio="none">
          <path d="M0 42 H110 Q122 42 122 54 V88 Q122 100 134 100 H220 M0 178 H154 Q166 178 166 166 V134 Q166 122 178 122 H220 M380 100 H464 Q476 100 476 88 V54 Q476 42 488 42 H600 M380 122 H422 Q434 122 434 134 V166 Q434 178 446 178 H600" />
          <path
            className={styles.pulse}
            pathLength="100"
            d="M0 42 H110 Q122 42 122 54 V88 Q122 100 134 100 H220 M380 122 H422 Q434 122 434 134 V166 Q434 178 446 178 H600"
          />
          <circle cx="121" cy="42" r="3" />
          <circle cx="475" cy="42" r="3" />
          <circle cx="165" cy="178" r="3" />
          <circle cx="433" cy="178" r="3" />
        </svg>
        <div className={styles.chip}>
          <span />
          <Motif size={62} strokeWidth={1} />
          <small>
            {slug === "plantini"
              ? "GROW"
              : slug === "smarthart"
                ? "INFER"
                : slug === "algobrain"
                  ? "SIGNAL"
                  : "PROCESS"}
          </small>
          <span />
        </div>
        <span className={styles.coordinate}>X: 0.50 / Y: 0.50</span>
      </div>
      <div className={styles.pipeline}>
        {pipeline.map((label, index) => (
          <span key={label} style={{ "--node-order": index } as CSSProperties}>
            <i />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
