import Image from "next/image";
import { ArrowUpRight, Bot, CircuitBoard, Cpu, Microscope, Play } from "lucide-react";
import { getArchive, getImpact } from "@/lib/content";
import { Eyebrow } from "./section-heading";

const icons = { robotics: Bot, ai: Cpu, pcb: CircuitBoard, research: Microscope };

export function ExperienceArchive() {
  const entries = [
    ...getImpact().map((entry) => ({
      ...entry,
      period: "2025–2026",
      mediaLabel: entry.photoLabel,
      videoUrl: "",
    })),
    ...getArchive(),
  ];
  return (
    <section
      id="impact"
      className="section archive-section"
      aria-labelledby="archive-heading"
    >
      <div className="container">
        <div className="story-heading archive-heading">
          <div>
            <Eyebrow>Projects, workshops &amp; outcomes</Eyebrow>
            <h2 id="archive-heading">My Stories &amp; Milestones</h2>
          </div>
          <p>
            Projects, teaching, research, and the moments behind them. Every card
            documents a real part of my work.
          </p>
        </div>
        <div className="archive-grid">
          {entries.map((entry, index) => {
            const Icon = icons[entry.motif];
            return (
              <article className={`archive-card archive-${entry.motif}`} key={entry.id}>
                <div className="archive-visual">
                  {entry.image ? (
                    <Image
                      src={entry.image}
                      alt={entry.alt}
                      fill
                      sizes="(max-width: 767px) 100vw, 50vw"
                    />
                  ) : (
                    <div className="archive-placeholder" aria-hidden="true">
                      <Icon strokeWidth={1.15} />
                      <span>{String(index + 1).padStart(2, "0")}</span>
                    </div>
                  )}
                  <p className="archive-media-label">{entry.mediaLabel}</p>
                  {entry.videoUrl && (
                    <a
                      className="archive-play"
                      href={entry.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Watch ${entry.title}`}
                    >
                      <Play size={16} fill="currentColor" />
                    </a>
                  )}
                </div>
                <div className="archive-copy">
                  <div className="archive-meta">
                    <p>{entry.category}</p>
                    <span>{entry.period}</span>
                  </div>
                  <h3>{entry.title}</h3>
                  <p>{entry.description}</p>
                  {entry.videoUrl && (
                    <a
                      className="text-link"
                      href={entry.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Watch the moment
                      <ArrowUpRight size={16} />
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
