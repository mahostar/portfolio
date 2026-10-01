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
export default async function Projects({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category: requestedCategory } = await searchParams;
  const projects = getProjects();
  const categories = ["All", ...new Set(projects.map((project) => project.category))];
  const category =
    categories.includes(requestedCategory || "") && requestedCategory !== "All"
      ? requestedCategory
      : undefined;
  const filtered = category
    ? projects.filter((project) => project.category === category)
    : projects;
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
      <div className="catalog-tools">
        <nav className="project-filters" aria-label="Filter projects">
          {categories.map((item) => {
            const count =
              item === "All"
                ? projects.length
                : projects.filter((project) => project.category === item).length;
            return (
              <Link
                key={item}
                href={
                  item === "All"
                    ? "/projects"
                    : `/projects?category=${encodeURIComponent(item)}`
                }
                scroll={false}
                className={
                  (!category && item === "All") || item === category ? "selected" : ""
                }
                aria-current={
                  (!category && item === "All") || item === category ? "true" : undefined
                }
              >
                {item}
                <span className="filter-count" aria-hidden="true">
                  {count}
                </span>
              </Link>
            );
          })}
        </nav>
        <p className="catalog-result" role="status">
          {filtered.length} {filtered.length === 1 ? "project" : "projects"}
          {category ? ` · ${category}` : ""}
        </p>
      </div>
      {filtered.length ? (
        <div className="project-list" key={category || "all"}>
          {filtered.map((project) => (
            <ProjectCard project={project} key={project.slug} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h2>No projects in this category yet.</h2>
          <Link className="text-link" href="/projects">
            View all projects
            <ArrowLeft size={18} />
          </Link>
        </div>
      )}
    </div>
  );
}
