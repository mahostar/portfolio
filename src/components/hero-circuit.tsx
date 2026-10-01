import { heroRoutes, cropRoute } from "@/content/hero-paths";
import type { CSSProperties } from "react";

// Keep the copper lighting while preserving the original hero composition.
export function HeroCircuit() {
  return (
    <div className="hero-circuit pcb-motion" aria-hidden="true">
      <div className="pcb-trace-mask">
        <span className="pcb-trace-light" />
        <span className="pcb-trace-sweep" />
      </div>
      {(["desktop", "mobile"] as const).map((crop) => (
        <svg key={crop} className={"pcb-pulses pcb-pulses-" + crop}
          viewBox={crop === "mobile" ? "0 0 650 793" : "0 0 1983 793"}
          preserveAspectRatio={crop === "desktop" ? "xMidYMid slice" : "none"}>
          {heroRoutes.map((route, index) => (
            <g key={route.id} style={{ "--pcb-delay": (0.5 + index * 0.055) + "s" } as CSSProperties}>
              <path className="pcb-pulse-glow" d={crop === "mobile" ? cropRoute(route.d, 1150) : route.d} pathLength="100" />
              <path className="pcb-pulse" d={crop === "mobile" ? cropRoute(route.d, 1150) : route.d} pathLength="100" />
            </g>
          ))}
        </svg>
      ))}
    </div>
  );
}
