import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProjectCard } from "@/components/project-card";
import { Eyebrow } from "@/components/section-heading";
import { getProjects, getSite } from "@/lib/content";
export const metadata: Metadata = { title: "Projects", description: "Hardware, embedded systems, and AI project case studies.", alternates: { canonical: "/projects" } };
export default async function Projects({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const projects = getProjects();
  const categories = ["All", ...new Set(projects.map((project) => project.category))];
  const filtered = category ? projects.filter((project) => project.category === category) : projects;
  return <div className="container projects-page"><Link className="text-link back-link" href="/#work"><ArrowLeft size={18} />Back home</Link>
    <Eyebrow>Ideas, made tangible</Eyebrow><h1>All projects<span className="heading-dot">.</span></h1><p className="page-intro">{getSite().projectsIntro}</p>
    <nav className="project-filters" aria-label="Filter projects">{categories.map((item) => <Link key={item} href={item === "All" ? "/projects" : `/projects?category=${encodeURIComponent(item)}`} scroll={false} className={(!category && item === "All") || item === category ? "selected" : ""} aria-current={(!category && item === "All") || item === category ? "true" : undefined}>{item}</Link>)}</nav>
    {filtered.length ? <div className="project-list">{filtered.map((project) => <ProjectCard project={project} key={project.slug} />)}</div> : <div className="empty-state"><h2>No projects in this category yet.</h2><Link className="text-link" href="/projects">View all projects<ArrowLeft size={18} /></Link></div>}
  </div>;
}
