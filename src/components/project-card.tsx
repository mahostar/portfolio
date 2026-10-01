import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Project } from "@/lib/content-schema";
import { TechLogo } from "./tech-logo";

export function ProjectCard({ project, featured = false }: { project: Project; featured?: boolean }) {
  const Heading = featured ? "h3" : "h2";
  return <Link href={`/projects/${project.slug}`} className="project-card" aria-label={`View project: ${project.title}`}>
    <div className="project-cover"><Image src={project.cover} alt="" fill sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1295px) 40vw, 504px" /></div>
    <div className="project-content">
      <div className="project-chips"><span className="category-chip">{project.category}</span>{project.placeholder && process.env.NODE_ENV === "development" && <span className="sample-tag">Sample</span>}</div>
      <Heading className="project-title">{project.title}</Heading>
      <p className="project-summary">{project.summary}</p>
      <div className="project-bottom"><div className="tech-row">{project.tech.slice(0, 4).map((id) => <TechLogo id={id} key={id} />)}</div><span className="arrow-circle" aria-hidden="true"><ArrowRight size={18} /></span></div>
    </div>
  </Link>;
}
