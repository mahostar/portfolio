import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Project } from "@/lib/content-schema";
import { TechLogo } from "./tech-logo";
import { ProjectSchematic, categoryColors } from "./project-schematic";
import type { CSSProperties } from "react";
import styles from "./project-card.module.css";

export function ProjectCard({
  project,
  featured = false,
}: {
  project: Project;
  featured?: boolean;
}) {
  const Heading = featured ? "h3" : "h2";
  return (
    <Link
      href={`/projects/${project.slug}`}
      className={`project-card ${styles.card}`}
      data-project={project.slug}
      style={
        { "--accent": categoryColors[project.category] || "#9bd2ff" } as CSSProperties
      }
      aria-label={`View project: ${project.title}`}
    >
      <div
        className={`project-cover ${styles.cover}`}
        style={project.coverFit === "contain" ? { background: "#fff" } : undefined}
      >
        {project.cover.endsWith(".svg") && project.pipeline.length > 0 ? (
          <ProjectSchematic slug={project.slug} pipeline={project.pipeline} />
        ) : (
          <Image
            src={project.cover}
            alt=""
            style={{ objectFit: project.coverFit }}
            fill
            sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1415px) calc((100vw - 120px) / 2), 646px"
          />
        )}
        {project.year && <span className={`project-year ${styles.year}`}>{project.year}</span>}
      </div>
      <div className={`project-content ${styles.content}`}>
        <Heading className={`project-title ${styles.title}`}>{project.title}</Heading>
        <p className={`project-summary ${styles.summary}`}>{project.summary}</p>
        <div className={`project-bottom ${styles.bottom}`}>
          <div className="tech-row">
            {project.tech.slice(0, 4).map((id) => (
              <TechLogo id={id} key={id} />
            ))}
          </div>
          <span className={`project-open ${styles.open}`} aria-hidden="true">
            <span>View project</span>
            <span className="arrow-circle">
              <ArrowRight size={18} />
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}
