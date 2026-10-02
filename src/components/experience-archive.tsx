import Image from "next/image";
import { ArrowUpRight, Bot, CircuitBoard, Cpu, Microscope, Play } from "lucide-react";
import { getArchive } from "@/lib/content";
import { getEvidence, type EvidenceItem } from "@/lib/evidence";
import { MediaGallery } from "./media-gallery";

const icons = { robotics: Bot, ai: Cpu, pcb: CircuitBoard, research: Microscope };

export function ExperienceArchive() {
  const entries = getArchive();
  return (
    <section
      id="impact"
      className="section archive-section"
      aria-labelledby="archive-heading"
    >
      <div className="container">
        <div className="story-heading archive-heading">
          <div>
            <h2 id="archive-heading">My achievements &amp; milestones</h2>
          </div>
        </div>
        <div className="archive-grid">
          {entries.map((entry) => {
            const Icon = icons[entry.motif];
            return (
              <article className={`archive-card archive-${entry.motif}`} data-story={entry.id} key={entry.id}>
                <div className="archive-visual">
                  {entry.image ? (
                    <Image
                      src={entry.image}
                      alt={entry.alt}
                      fill
                      sizes="(max-width: 767px) 100vw, 50vw"
                      unoptimized={entry.id === "solar-training"}
                    />
                  ) : (
                    <div className="archive-placeholder" aria-hidden="true">
                      <Icon strokeWidth={1.15} />
                    </div>
                  )}
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
                    {entry.period && <span>{entry.period}</span>}
                  </div>
                  <h3>{entry.title}</h3>
                  <MediaGallery compact story={entry.description} title={entry.title} items={entry.mediaIds.map(getEvidence).filter((item): item is EvidenceItem => !!item)} />
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
