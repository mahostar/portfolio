import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getProjects } from "@/lib/content";
import { TechLogo } from "@/components/tech-logo";
import { Eyebrow } from "@/components/section-heading";
export const dynamicParams = false;
export function generateStaticParams() { return getProjects().map((project) => ({ slug: project.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const project = getProjects().find((item) => item.slug === slug);
  if (!project) return { title: "Project not found" };
  return { title: project.title, description: project.summary, alternates: { canonical: `/projects/${slug}` }, openGraph: { title: project.title, description: project.summary, images: [{ url: project.cover }] }, twitter: { title: project.title, description: project.summary, images: [project.cover] } };
}
export default async function CaseStudy({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const project = getProjects().find((item) => item.slug === slug); if (!project) notFound();
  return <article className="container case-study"><Link className="text-link back-link" href="/projects"><ArrowLeft size={18} />All projects</Link><Eyebrow>{project.category}</Eyebrow><h1>{project.title}</h1><p className="case-summary">{project.summary}</p>
    <div className="case-cover"><Image src={project.cover} fill preload sizes="(max-width: 767px) 100vw, 1200px" alt={project.placeholder ? `${project.title} — illustrative sample image` : project.title} /></div>
    <div className="case-meta"><div><span className="meta-label">Role</span><p>{project.role}</p></div><div><span className="meta-label">Year</span><p>{project.year}</p></div><div><span className="meta-label">Built with</span><div className="tech-row">{project.tech.map((id) => <TechLogo key={id} id={id} />)}</div></div><div className="case-links">{Object.entries(project.links).filter(([, url]) => url).map(([label, url]) => <a className="text-link" href={url} key={label} target="_blank" rel="noreferrer">{label === "github" ? "GitHub" : label === "demo" ? "Live demo" : "Video"}<ArrowUpRight size={16} /></a>)}</div></div>
    <div className="case-body"><MDXRemote source={project.body} /></div><div className="case-end"><Link href="/projects" className="text-link"><ArrowLeft size={18} />Explore all projects</Link></div>
  </article>;
}
