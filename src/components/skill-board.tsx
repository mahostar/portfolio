"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode, type KeyboardEvent } from "react";
import { ArrowUpRight, CircuitBoard, Code2, Cpu, Layers3, Sparkles } from "lucide-react";
import styles from "./skill-board.module.css";

type Group = {
  id: string;
  name: string;
  description: string;
  tools: { id: string; name: string; logo: ReactNode }[];
  projects: { slug: string; title: string }[];
};
const icons = [CircuitBoard, Cpu, Sparkles, Code2, Layers3];

export function SkillBoard({ groups }: { groups: Group[] }) {
  const [active, setActive] = useState(() => Math.min(2, groups.length - 1));
  const [wire, setWire] = useState("");
  const [arrived, setArrived] = useState(false);
  const host = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const selected = groups[active];

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const tab = tabs.current[active];
        const target = panel.current;
        if (!tab || !target) return;
        const list = tab.parentElement;
        if (list && list.scrollWidth > list.clientWidth)
          list.scrollLeft = Math.max(
            0,
            tab.offsetLeft - list.offsetLeft - list.clientWidth / 2 + tab.offsetWidth / 2,
          );
        const bounds = element.getBoundingClientRect();
        const from = tab.getBoundingClientRect();
        const to = target.getBoundingClientRect();
        const x = from.right - bounds.left;
        const y = from.top + from.height / 2 - bounds.top;
        const endX = to.left - bounds.left;
        const endY = to.top + 60 - bounds.top;
        const mid = x + (endX - x) / 2;
        const direction = Math.sign(endY - y);
        const radius = Math.min(8, Math.abs(endY - y) / 2);
        setWire(
          radius < 1
            ? `M ${x} ${y} H ${endX}`
            : `M ${x} ${y} H ${mid - radius} Q ${mid} ${y} ${mid} ${y + direction * radius} V ${endY - direction * radius} Q ${mid} ${endY} ${mid + radius} ${endY} H ${endX}`,
        );
      });
    };
    const resize = new ResizeObserver(measure);
    resize.observe(element);
    if (panel.current) resize.observe(panel.current);
    const visible = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setArrived(true);
          visible.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    visible.observe(element);
    measure();
    void document.fonts.ready.then(measure);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      visible.disconnect();
    };
  }, [active]);

  if (!selected) return null;
  const selectWithKeys = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = index;
    if (event.key === "ArrowRight" || event.key === "ArrowDown")
      next = (index + 1) % groups.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp")
      next = (index + groups.length - 1) % groups.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = groups.length - 1;
    else return;
    event.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
    tabs.current[next]?.scrollIntoView({
      block: "nearest",
      inline: "nearest",
      behavior: "instant",
    });
  };
  return (
    <div ref={host} className={styles.board} data-arrived={arrived}>
      <div className={styles.tabs} role="tablist" aria-label="Engineering domains">
        {groups.map((group, index) => {
          const Icon = icons[index % icons.length];
          return (
            <button
              key={group.id}
              ref={(node) => {
                tabs.current[index] = node;
              }}
              role="tab"
              id={`tab-${group.id}`}
              aria-controls={active === index ? `panel-${group.id}` : undefined}
              aria-selected={active === index}
              tabIndex={active === index ? 0 : -1}
              onClick={() => setActive(index)}
              onKeyDown={(event) => selectWithKeys(event, index)}
              className={styles.tab}
            >
              <span className={styles.number}>{String(index + 1).padStart(2, "0")}</span>
              <Icon size={19} strokeWidth={1.6} aria-hidden="true" />
              <span>{group.name}</span>
              <span className={styles.port} aria-hidden="true" />
            </button>
          );
        })}
      </div>
      <svg className={styles.wire} aria-hidden="true">
        <path d={wire} />
        <path key={active} d={wire} pathLength="100" className={styles.signal} />
        <path
          key={`pulse-${active}`}
          d={wire}
          pathLength="100"
          className={styles.pulse}
        />
      </svg>
      <div
        ref={panel}
        className={styles.panel}
        role="tabpanel"
        id={`panel-${selected.id}`}
        aria-labelledby={`tab-${selected.id}`}
        tabIndex={0}
      >
        <div className={styles.panelHeader}>
          <span>
            <i /> DOMAIN / {String(active + 1).padStart(2, "0")}
          </span>
          <span>{selected.tools.length} TOOLS</span>
        </div>
        <h3>{selected.name}</h3>
        <p className={styles.description}>{selected.description}</p>
        <div className={`${styles.tools} skill-items`}>
          {selected.tools.map((tool) => (
            <div className={styles.tool} key={tool.id}>
              {tool.logo}
            </div>
          ))}
        </div>
        {selected.projects.length > 0 && (
          <div className={styles.proof}>
            <p>IN THE WORK</p>
            <div>
              {selected.projects.map((project) => (
                <Link key={project.slug} href={`/projects/${project.slug}`}>
                  {project.title}
                  <ArrowUpRight size={14} />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
