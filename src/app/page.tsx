import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Hero } from "@/components/hero";
import { Eyebrow } from "@/components/section-heading";
import { ProjectCard } from "@/components/project-card";
import { TechLogo } from "@/components/tech-logo";
import { ContactForm } from "@/components/contact-form";
import { Reveal } from "@/components/hero-motion";
import { getProjects, getSite, getTechnologies, getTimeline } from "@/lib/content";
import { techGroups } from "@/content/tech";
import { siteUrl } from "@/content/site";

export default function Home() {
  const site = getSite();
  const featured = getProjects().filter((project) => project.featured);
  const technologies = getTechnologies();
  const person = { "@context": "https://schema.org", "@type": "Person", name: site.fullName, jobTitle: site.roleLabel, url: siteUrl, sameAs: [site.github, site.linkedin].filter(Boolean) };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(person).replace(/</g, "\\u003c") }} />
    <Hero />
    <section id="work" className="featured section" aria-labelledby="featured-heading"><div className="container">
      <div className="section-header"><div><Eyebrow>Selected work</Eyebrow><h2 id="featured-heading">Featured Projects</h2></div><Link href="/projects" className="text-link all-projects">View all projects<span className="arrow-circle"><ArrowRight size={18} /></span></Link></div>
      <Reveal><div className="featured-grid">{featured.map((project) => <ProjectCard key={project.slug} project={project} featured />)}</div></Reveal>
      <div className="more-projects"><Link href="/projects" className="text-link">Explore all {getProjects().length} projects<ArrowRight size={18} /></Link></div>
    </div></section>
    <section id="about" className="section about-section" aria-labelledby="about-heading"><div className="container"><Reveal>
      <Eyebrow>Behind the work</Eyebrow><div className="about-grid"><div><h2 id="about-heading" className="large-heading">{site.aboutHeading}</h2><p className="about-note">{site.aboutNote}</p></div><div className="about-body"><p>{site.aboutText}</p>{(site.location || site.openTo) && <dl className="facts">{site.location && <div><dt>Location</dt><dd>{site.location}</dd></div>}{site.openTo && <div><dt>Open to</dt><dd>{site.openTo}</dd></div>}</dl>}</div></div>
    </Reveal></div></section>
    <section id="skills" className="section skills-section" aria-labelledby="skills-heading"><div className="container"><Reveal>
      <div className="section-header"><div><Eyebrow>The toolkit</Eyebrow><h2 id="skills-heading">What I work with</h2></div></div><div className="skills-grid">{techGroups.map((group) => { const items = technologies.filter((item) => item.group === group); return items.length ? <div className="skill-group" key={group}><h3>{group}</h3><div className="skill-items">{items.map((item) => <TechLogo key={item.id} id={item.id} withName />)}</div></div> : null; })}</div>
    </Reveal></div></section>
    <section id="timeline" className="section timeline-section" aria-labelledby="timeline-heading"><div className="container timeline-grid">
      <div><Eyebrow>Always learning</Eyebrow><h2 id="timeline-heading" className="large-heading">Certifications<br />& achievements</h2></div><ol className="timeline">{getTimeline().map((item) => <li key={`${item.date}-${item.title}`}><time dateTime={item.date}>{new Intl.DateTimeFormat("en", { month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${item.date}-01T00:00:00Z`))}</time><div><span className="timeline-type">{item.type}</span><h3>{item.title}</h3><p>{item.issuer}</p>{item.url && <a href={item.url} target="_blank" rel="noreferrer" className="text-link">Verify<ArrowUpRight size={16} /></a>}</div></li>)}</ol>
    </div></section>
    <section id="contact" className="section contact-section" aria-labelledby="contact-heading"><div className="container contact-grid">
      <div className="contact-copy"><Eyebrow>Let’s connect</Eyebrow><h2 id="contact-heading">{site.contactHeading}</h2><p>{site.contactCopy}</p><div className="contact-links">{[{ label: "Email", href: site.email ? `mailto:${site.email}` : "" }, { label: "GitHub", href: site.github }, { label: "LinkedIn", href: site.linkedin }].filter((link) => link.href).map((link) => <a className="text-link" href={link.href} key={link.label}>{link.label}<ArrowUpRight size={17} /></a>)}</div></div><ContactForm email={site.email} note={site.contactNote} />
    </div></section>
  </>;
}
