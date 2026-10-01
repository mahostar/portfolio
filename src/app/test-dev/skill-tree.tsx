"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useMotionPreference } from "@/lib/use-motion-preference";

import {
  ArrowUpRight,
  Box,
  CircuitBoard,
  Code2,
  Cpu,
  Network,
  Pause,
  Play,
  ScanLine,
} from "lucide-react";
import styles from "./skill-tree.module.css";

type Group = {
  id: string;
  name: string;
  description: string;
  tools: { id: string; name: string; logo: ReactNode }[];
};
type Wire = { id: string; group: string; tool?: string; d: string };
const icons = [CircuitBoard, Cpu, ScanLine, Code2, Box];

// Rounded orthogonal paths connect the actual button bounds. Font loading and
// responsive reflow can change those bounds, so no viewport coordinates are fixed.
function route(points: [number, number][]) {
  let d = `M${points[0][0]},${points[0][1]}`;
  for (let i = 1; i < points.length - 1; i++) {
    const [px, py] = points[i - 1];
    const [x, y] = points[i];
    const [nx, ny] = points[i + 1];
    const before = Math.hypot(x - px, y - py);
    const after = Math.hypot(nx - x, ny - y);
    if (!before || !after) {
      d += ` L${x},${y}`;
      continue;
    }
    const radius = Math.min(9, before / 2, after / 2);
    d += ` L${x + ((px - x) * radius) / before},${y + ((py - y) * radius) / before}`;
    d += ` Q${x},${y} ${x + ((nx - x) * radius) / after},${y + ((ny - y) * radius) / after}`;
  }
  return `${d} L${points.at(-1)![0]},${points.at(-1)![1]}`;
}

export function SkillTree({ groups }: { groups: Group[] }) {
  const canvas = useRef<HTMLDivElement>(null);
  const reduced = useMotionPreference();
  const [wires, setWires] = useState<Wire[]>([]);
  const [selection, setSelection] = useState<{ group: string; tool?: string } | null>(
    () => (groups.length ? { group: (groups[1] ?? groups[0]).id } : null),
  );
  const [hovered, setHovered] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(true);
  const activeGroup = hovered ?? selection?.group;

  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    let frame = 0;
    let disposed = false;
    const measure = () => {
      frame = 0;
      const box = element.getBoundingClientRect();
      const root = element.querySelector<HTMLElement>("[data-root]")!;
      const mobile = window.matchMedia("(max-width: 900px)").matches;
      const rect = (node: HTMLElement) => {
        const r = node.getBoundingClientRect();
        return {
          left: r.left - box.left,
          top: r.top - box.top,
          right: r.right - box.left,
          bottom: r.bottom - box.top,
          cx: r.left - box.left + r.width / 2,
          cy: r.top - box.top + r.height / 2,
        };
      };
      const origin = rect(root);
      const next: Wire[] = [];
      element.querySelectorAll<HTMLElement>("[data-group]").forEach((section) => {
        const group = section.dataset.group!;
        const category = rect(section.querySelector<HTMLElement>("[data-category]")!);
        next.push({
          id: group,
          group,
          d: mobile
            ? route([
                [origin.left, origin.cy],
                [14, origin.cy],
                [14, category.cy],
                [category.left, category.cy],
              ])
            : route([
                [origin.cx, origin.bottom],
                [origin.cx, origin.bottom + 26],
                [category.cx, origin.bottom + 26],
                [category.cx, category.top],
              ]),
        });
        section.querySelectorAll<HTMLElement>("[data-tool]").forEach((node) => {
          const leaf = rect(node);
          const rail = leaf.left - 14;
          next.push({
            id: `${group}-${node.dataset.tool}`,
            group,
            tool: node.dataset.tool,
            d: route([
              [category.cx, category.bottom],
              [category.cx, category.bottom + 16],
              [rail, category.bottom + 16],
              [rail, leaf.cy],
              [leaf.left, leaf.cy],
            ]),
          });
        });
      });
      setWires(next);
    };
    const schedule = () => {
      if (!disposed && !frame) frame = requestAnimationFrame(measure);
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(element);
    element
      .querySelectorAll<HTMLElement>("button")
      .forEach((node) => observer.observe(node));
    window.addEventListener("resize", schedule, { passive: true });
    document.fonts.ready.then(schedule);
    schedule();
    return () => {
      disposed = true;
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", schedule);
    };
  }, [groups]);

  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    let inView = true;
    const sync = () => setVisible(inView && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    });
    observer.observe(element);
    document.addEventListener("visibilitychange", sync);
    sync();
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  return (
    <div className={styles.board} data-paused={paused || !visible || !!reduced}>
      <div className={styles.boardBar}>
        <span>
          <i />
          LIVE TOOLKIT
        </span>
        <div>
          <span>
            {groups.length} branches /{" "}
            {groups.reduce((total, group) => total + group.tools.length, 0)} tools
          </span>
          <button
            type="button"
            onClick={() => setPaused((value) => !value)}
            aria-label={paused ? "Resume signal animation" : "Pause signal animation"}
            aria-pressed={paused}
          >
            {paused ? <Play size={14} /> : <Pause size={14} />}
          </button>
        </div>
      </div>
      <div ref={canvas} className={styles.canvas}>
        <svg className={styles.wires} aria-hidden="true" focusable="false">
          {wires.map((wire) => {
            const active =
              wire.group === activeGroup &&
              (!wire.tool ||
                !selection?.tool ||
                !!hovered ||
                wire.tool === selection.tool);
            return (
              <g key={wire.id} data-active={active}>
                <path d={wire.d} className={styles.wire} pathLength={100} />
                {active && <path d={wire.d} className={styles.signal} pathLength={100} />}
              </g>
            );
          })}
        </svg>
        <button
          type="button"
          data-root
          className={styles.root}
          onClick={() => {
            setSelection(null);
            setHovered(null);
          }}
          aria-label="Show the whole toolkit"
        >
          <span className={styles.rootIcon}>
            <Network size={23} />
          </span>
          <span>
            <small>MED WASSIM MBAREK</small>
            <strong>Engineering toolkit</strong>
          </span>
          <span className={styles.rootLight} />
        </button>
        <div className={styles.branches}>
          {groups.map((group, index) => {
            const Icon = icons[index % icons.length];
            return (
              <section
                key={group.id}
                data-group={group.id}
                className={styles.branch}
                data-active={activeGroup === group.id}
                onPointerEnter={(event) => {
                  if (event.pointerType === "mouse") setHovered(group.id);
                }}
                onPointerLeave={() => setHovered(null)}
                aria-labelledby={`${group.id}-title`}
              >
                <button
                  type="button"
                  data-category
                  className={styles.category}
                  aria-pressed={selection?.group === group.id && !selection?.tool}
                  onClick={() => setSelection({ group: group.id })}
                >
                  <span className={styles.categoryTop}>
                    <Icon size={20} strokeWidth={1.6} />
                    <small>{String(index + 1).padStart(2, "0")}</small>
                  </span>
                  <span className={styles.categoryTitle} id={`${group.id}-title`}>
                    {group.name}
                  </span>
                  <span className={styles.port} aria-hidden="true" />
                </button>
                <ul className={styles.tools}>
                  {group.tools.map((tool) => (
                    <li key={tool.id}>
                      <button
                        type="button"
                        data-tool={tool.id}
                        className={styles.tool}
                        data-selected={selection?.tool === tool.id}
                        aria-pressed={selection?.tool === tool.id}
                        onClick={() => setSelection({ group: group.id, tool: tool.id })}
                      >
                        <span className={styles.socket} aria-hidden="true" />
                        {tool.logo}
                        <ArrowUpRight
                          size={13}
                          className={styles.nodeArrow}
                          aria-hidden="true"
                        />
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
