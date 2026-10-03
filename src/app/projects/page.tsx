import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProjectCard } from "@/components/project-card";
import { Eyebrow } from "@/components/section-heading";
import { getProjects, getSite } from "@/lib/content";
export const metadata: Metadata = {
  title: "Projects",
  description: "Hardware, embedded systems, and AI project case studies.",
  alternates: { canonical: "/projects" },
};
export default function Projects() {
  const projects = getProjects();
  return (
    <div className="container projects-page">
      <Link className="text-link back-link" href="/#work">
        <ArrowLeft size={18} />
        Back home
      </Link>
      <div className="catalog-heading">
        <div>
          <Eyebrow>Ideas, made tangible</Eyebrow>
          <h1>
            All projects<span className="heading-dot">.</span>
          </h1>
          <p className="page-intro">{getSite().projectsIntro}</p>
        </div>
        <p className="catalog-total">
          <strong>{String(projects.length).padStart(2, "0")}</strong>
          <span>
            Projects
            <br />
            across the stack
          </span>
        </p>
      </div>
      <div className="project-list">
        {projects.map((project) => (
          <ProjectCard project={project} key={project.slug} />
        ))}
      </div>
    </div>
  );
}
