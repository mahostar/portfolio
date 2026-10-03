"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import * as m from "motion/react-m";
import {
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
  const reduced = useReducedMotion();
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
      const svg = element.querySelector<SVGSVGElement>("svg");
      if (!svg) return;
      const bounds = svg.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      // Normalize rendered pixels to local SVG units using its actual size.
      // Browsers differ in whether getScreenCTM includes CSS zoom.
      const size = getComputedStyle(svg);
      const scaleX = parseFloat(size.width) / bounds.width;
      const scaleY = parseFloat(size.height) / bounds.height;
      const root = element.querySelector<HTMLElement>("[data-root]")!;
      const mobile = window.matchMedia("(max-width: 900px)").matches;
      const rect = (node: HTMLElement) => {
        const r = node.getBoundingClientRect();
        const left = (r.left - bounds.left) * scaleX;
        const top = (r.top - bounds.top) * scaleY;
        const right = (r.right - bounds.left) * scaleX;
        const bottom = (r.bottom - bounds.top) * scaleY;
        return {
          left,
          top,
          right,
          bottom,
          cx: (left + right) / 2,
          cy: (top + bottom) / 2,
        };
      };
      const origin = rect(root);
      const branches = [...element.querySelectorAll<HTMLElement>("[data-group]")];
      const categories = branches.map((section) =>
        rect(section.querySelector<HTMLElement>("[data-category]")!),
      );
      if (!categories.length) {
        setWires([]);
        return;
      }
      const next: Wire[] = [];
      const parentY = origin.bottom + 18;
      if (mobile) {
        next.push({
          id: "root-trunk",
          group: "root",
          d: route([
            [origin.left, origin.cy],
            [14, origin.cy],
            [14, categories.at(-1)!.cy],
          ]),
        });
      } else {
        next.push({
          id: "root-stem",
          group: "root",
          d: route([
            [origin.cx, origin.bottom],
            [origin.cx, parentY],
          ]),
        });
        next.push({
          id: "root-bus",
          group: "root",
          d: route([
            [categories[0].cx, parentY],
            [categories.at(-1)!.cx, parentY],
          ]),
        });
      }
      branches.forEach((section, index) => {
        const group = section.dataset.group!;
        const category = categories[index];
        next.push({
          id: group,
          group,
          d: mobile
            ? route([
                [14, category.cy],
                [category.left, category.cy],
              ])
            : route([
                [category.cx, parentY],
                [category.cx, category.top],
              ]),
        });
        const leaves = [...section.querySelectorAll<HTMLElement>("[data-tool]")].map(
          (node) => ({ node, box: rect(node) }),
        );
        if (!leaves.length) return;
        const side = mobile && window.innerWidth > 350;
        if (side && leaves.length === 1) {
          const leaf = leaves[0];
          const midpoint = (category.right + leaf.box.left) / 2;
          next.push({
            id: group + "-" + leaf.node.dataset.tool,
            group,
            tool: leaf.node.dataset.tool,
            d: route([
              [category.right, category.cy],
              [midpoint, category.cy],
              [midpoint, leaf.box.cy],
              [leaf.box.left, leaf.box.cy],
            ]),
          });
          return;
        }
        const busY = Math.min(...leaves.map((leaf) => leaf.box.top)) - 12;
        const columns = new Map<number, typeof leaves>();
        for (const leaf of leaves) {
          const key = Math.round(leaf.box.left);
          columns.set(key, [...(columns.get(key) || []), leaf]);
        }
        const rails = [...columns.values()].map((column) => ({
          x: column[0].box.left - 12,
          leaves: column,
        }));
        const minX = Math.min(...rails.map((rail) => rail.x));
        const maxX = Math.max(...rails.map((rail) => rail.x));
        next.push({
          id: group + "-stem",
          group,
          d: side
            ? route([
                [category.right, category.cy],
                [minX, category.cy],
              ])
            : route([
                [category.cx, category.bottom],
                [category.cx, busY],
                [minX, busY],
              ]),
        });
        if (maxX !== minX)
          next.push({
            id: group + "-bus",
            group,
            d: route([
              [minX, busY],
              [maxX, busY],
            ]),
          });
        for (const [columnIndex, rail] of rails.entries()) {
          next.push({
            id: group + "-rail-" + columnIndex,
            group,
            d: route([
              [rail.x, side && columnIndex === 0 ? Math.min(busY, category.cy) : busY],
              [rail.x, Math.max(...rail.leaves.map((leaf) => leaf.box.cy), side && columnIndex === 0 ? category.cy : busY)],
            ]),
          });
          for (const { node, box: leaf } of rail.leaves)
            next.push({
              id: group + "-" + node.dataset.tool,
              group,
              tool: node.dataset.tool,
              d: route([
                [rail.x, leaf.cy],
                [leaf.left, leaf.cy],
              ]),
            });
        }
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
    <div
      className={styles.board}
      data-skill-tree
      data-paused={paused || !visible || !!reduced}
    >
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
              <g key={wire.id} data-active={active} data-wire-tool={wire.tool}>
                <m.path
                  d={wire.d}
                  className={styles.wire}
                  initial={{ pathLength: reduced ? 1 : 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: reduced ? 0 : 0.8, ease: "easeOut" }}
                />
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
            <small>MOHAMED WASSIM MBAREK</small>
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
