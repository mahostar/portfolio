import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { getProjects } from "@/lib/content";
import { TechLogo } from "@/components/tech-logo";
import { Eyebrow } from "@/components/section-heading";
import { sections, paperSections } from "@/lib/content-schema";
import type { ComponentPropsWithoutRef } from "react";
import styles from "./case-study.module.css";
import { getProjectEvidence, type EvidenceItem } from "@/lib/evidence";
import { MediaGallery } from "@/components/media-gallery";
import { ProjectFigure } from "@/components/project-figure";

const sectionId = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
const mdxComponents = {
  h2: ({ children, ...props }: ComponentPropsWithoutRef<"h2">) => (
    <h2 {...props} id={typeof children === "string" ? sectionId(children) : props.id}>
      {children}
    </h2>
  ),
};
export const dynamicParams = false;
export function generateStaticParams() {
  return getProjects().map((project) => ({ slug: project.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjects().find((item) => item.slug === slug);
  if (!project) return { title: "Project not found" };
  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: `/projects/${slug}` },
    openGraph: {
      title: project.title,
      description: project.summary,
      images: [
        {
          url: `/projects/${slug}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: project.title,
        },
      ],
    },
    twitter: {
      title: project.title,
      description: project.summary,
      images: [`/projects/${slug}/opengraph-image`],
    },
  };
}
export default async function CaseStudy({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const projects = getProjects();
  const project = projects.find((item) => item.slug === slug);
  if (!project) notFound();
  const nextProject =
    projects.length > 1
      ? projects[(projects.findIndex((item) => item.slug === slug) + 1) % projects.length]
      : undefined;
  const links = Object.entries(project.links).filter(([, url]) => url);
  const isPaper = project.format === "paper";
  const evidence = getProjectEvidence(project.slug);
  const figures: EvidenceItem[] = [...project.body.matchAll(/<ProjectFigure\s+([^>]+)\/>/g)].map((match, index) => {
    const attributes = match[1];
    const value = (name: string) => attributes.match(new RegExp(`${name}="([^"]+)"`))?.[1] ?? "";
    const dimension = (name: string, fallback: number) => Number(attributes.match(new RegExp(`${name}=\\{(\\d+)\\}`))?.[1] ?? fallback);
    return { id: `${project.slug}-figure-${index}`, src: value("src"), preview: value("src"), thumbnail: value("src"),
      type: "image", caption: value("alt"), alt: value("alt"), width: dimension("width", 1200), height: dimension("height", 570),
      concept: false, tags: [`project:${project.slug}`], folder: `projects/${project.slug}` };
  });
  const cover: EvidenceItem = { id: `${project.slug}-cover`, src: project.cover, preview: project.cover, thumbnail: project.cover,
    type: "image", caption: `${project.title} — concept illustration`, alt: `${project.title} concept illustration`, width: 1600, height: 900,
    concept: true, tags: [`project:${project.slug}`], folder: `projects/${project.slug}` };
  const galleryItems = [cover, ...figures, ...evidence].filter((item, index, all) => all.findIndex((other) => other.src === item.src) === index);
  const components = { ...mdxComponents,
    ProjectFigure: (props: Omit<ComponentPropsWithoutRef<typeof ProjectFigure>, "items">) => <ProjectFigure {...props} items={galleryItems} />,
    ProjectMedia: () => <MediaGallery items={evidence} title="Inspection artifacts" headingLevel={3} />,
    ProjectAlbum: () => <MediaGallery
      items={[...evidence].sort((a, b) => {
        const priority = (item: EvidenceItem) => item.concept ? 3
          : /\/milestones\/|\/certificates\//.test(item.src) ? 2
          : /\/hardware\/|\/prototype[s]?\/|\/manufacturing\/|\/models\/|\/saved-output-/.test(item.src) ? 0 : 1;
        return priority(a) - priority(b);
      })}
      title={`Building and testing ${project.title}`} headingLevel={3} moreLabel="View more" />,
  };
  const coverImage = <Image src={project.cover} style={{ objectFit: project.coverFit }} fill preload
    sizes="(max-width: 767px) 100vw, 1200px"
    alt={project.placeholder ? `${project.title} — illustrative sample image` : project.title} />;
  return (
    <article className={`container case-study${isPaper ? ` ${styles.paper}` : ""}`}>
      <Link className="text-link back-link" href="/projects">
        <ArrowLeft size={18} />
        All projects
      </Link>
      <div className="case-heading">
        <Eyebrow>{isPaper ? `${project.title} · Technical paper` : project.category}</Eyebrow>
        <h1>
          {project.paperTitle ?? project.title}
          {!isPaper && <span className="heading-dot">.</span>}
        </h1>
        <p className="case-summary">{project.summary}</p>
      </div>
      <div className="case-cover" style={project.coverFit === "contain" ? { background: "#fff" } : undefined}>
        {project.coverVideo ? (
          <video src={project.coverVideo} poster={project.cover} controls playsInline preload="none" aria-label={`${project.title} principal demonstration`} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        ) : isPaper ? <MediaGallery items={galleryItems} title={project.title} initialSrc={project.cover}
          triggerClassName={styles.coverTrigger} triggerLabel={`Open ${project.title} cover in gallery`}>
          {coverImage}
        </MediaGallery> : coverImage}
      </div>
      {!!(project.role || project.year || project.tech.length || links.length) && <div className={`case-meta${links.length ? "" : " case-meta-no-links"}`}>
        {project.role && <div>
          <span className="meta-label">Role</span>
          <p>{project.role}</p>
        </div>}
        {project.year && <div>
          <span className="meta-label">Year</span>
          <p>{project.year}</p>
        </div>}
        {!!project.tech.length && <div>
          <span className="meta-label">Built with</span>
          <div className="tech-row">
            {project.tech.map((id) => (
              <TechLogo key={id} id={id} />
            ))}
          </div>
        </div>}
        {links.length > 0 && (
          <div className="case-links">
            {links.map(([label, url]) => (
              <a
                className="text-link"
                href={url}
                key={label}
                target="_blank"
                rel="noreferrer"
              >
                {label === "github" ? "GitHub" : label === "demo" ? "Live demo" : "Video"}
                <ArrowUpRight size={16} />
              </a>
            ))}
          </div>
        )}
      </div>}
      {!isPaper && <MediaGallery items={evidence} title="Inside the project" />}
      <div className="case-reading-layout">
        <nav
          className={`case-contents ${styles.contents}`}
          aria-label={isPaper ? "Paper contents" : "In this case study"}
        >
          <p className="eyebrow">{isPaper ? "Contents" : "In this project"}</p>
          {(isPaper ? paperSections : sections).map((title, index) => (
            <a href={`#${sectionId(title)}`} key={title}>
              <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              {title}
            </a>
          ))}
        </nav>
        <div className="case-body">
          <MDXRemote source={project.body} components={components} options={{ mdxOptions: {
            remarkPlugins: isPaper ? [remarkMath, remarkGfm] : [],
            rehypePlugins: isPaper ? [[rehypeKatex, { strict: "error", throwOnError: true, trust: false }]] : [],
          } }} />
        </div>
      </div>
      <div className="case-end">
        <Link href="/projects" className="text-link">
          <ArrowLeft size={18} />
          Explore all projects
        </Link>
        {nextProject && (
          <Link href={`/projects/${nextProject.slug}`} className="case-next">
            <span className="eyebrow">Next project</span>
            <strong>{nextProject.title}</strong>
            <ArrowUpRight size={24} />
          </Link>
        )}
      </div>
    </article>
  );
}
