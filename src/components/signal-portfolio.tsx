import Link from "next/link";
import { JetBrains_Mono } from "next/font/google";
import {
  ArrowRight,
  ArrowUpRight,
  Cpu,
  Layers3,
  Radio,
  Sparkles,
  MapPin,
  BriefcaseBusiness,
} from "lucide-react";
import { siGithub } from "simple-icons";
import {
  getProjects,
  getSite,
  getCertificates,
  getCertificateSlots,
} from "@/lib/content";
import { ProjectCard } from "./project-card";
import { Journey, BeyondEngineering } from "./story-sections";
import { ExperienceArchive } from "./experience-archive";
import { CertificateGallery } from "./certificate-gallery";
import { ResearchJournal } from "./research-journal";
import { ContactForm } from "./contact-form";
import { ContactHeading } from "./contact-heading";
import { LiquidGlassPanel } from "./liquid-glass";
import { SkillsTreeSection } from "./skills-tree-section";
import styles from "./signal-portfolio.module.css";

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-signal-mono",
  display: "swap",
  preload: false,
});
const chain = [
  { name: "Electronics", detail: "The physical foundation", Icon: Radio },
  { name: "Firmware", detail: "Connecting the hardware", Icon: Cpu },
  { name: "Intelligence", detail: "Models at the edge", Icon: Sparkles },
  { name: "Product", detail: "The complete system", Icon: Layers3 },
];
export function SignalPortfolio() {
  const site = getSite();
  const projects = getProjects();
  const homeOrder = ["plantini", "aquaflow", "easyshield", "windweave", "smarthart", "algobrain", "tpms-generator"];
  const featured = homeOrder.flatMap((slug) => projects.filter((project) => project.slug === slug));
  return (
    <div className={`${styles.site} ${mono.variable}`} data-signal-site>
      <section
        id="work"
        className={`section featured ${styles.work}`}
        aria-labelledby="featured-heading"
      >
        <div className={styles.container}>
          <div className={`section-header ${styles.heading}`}>
            <div>
              <h2 id="featured-heading">My projects</h2>
            </div>
            <div className={styles.headingSide}>
              <Link href="/projects" className={styles.action}>
                All {projects.length} projects <ArrowUpRight size={18} />
              </Link>
            </div>
          </div>
          <div className={`featured-grid ${styles.projectGrid}`}>
            {featured.map((project) => (
              <ProjectCard key={project.slug} project={project} featured />
            ))}
          </div>
          <div className={`more-projects ${styles.workEnd}`}>
            <span>Each project connects another part of the chain.</span>
            <Link href="/projects" className={`${styles.action} ${styles.projectButton}`}>
              Explore all {projects.length} projects <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
      <section
        id="about"
        className={`section about-section ${styles.about}`}
        aria-labelledby="about-heading"
      >
        <div className={styles.container}>
          <div className={styles.aboutGrid}>
            <div>
              <h2 id="about-heading">
                From the circuit
                <br />
                to the{" "}
                <span>
                  complete
                  <br className={styles.desktopBreak} /> system.
                </span>
              </h2>
              <p className={styles.aboutNote}>{site.aboutNote}</p>
            </div>
            <div className={styles.biography}>
              <p>{site.aboutText}</p>
              <dl className={styles.facts}>
                {site.location && (
                  <div>
                    <dt>
                      <MapPin size={13} aria-hidden="true" /> BASED IN
                    </dt>
                    <dd>{site.location}</dd>
                  </div>
                )}
                {site.openTo && (
                  <div>
                    <dt>
                      <BriefcaseBusiness size={13} aria-hidden="true" /> OPEN TO
                    </dt>
                    <dd>{site.openTo}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
          <ol className={styles.chain} aria-label="Engineering from circuit to product">
            {chain.map(({ name, detail, Icon }, index) => (
              <li key={name}>
                <span className={styles.chainStep}>
                  {String(index + 1).padStart(2, "0")}
                  <Icon size={24} strokeWidth={1.3} />
                </span>
                <h3>{name}</h3>
                <p>{detail}</p>
                {index < chain.length - 1 && (
                  <ArrowRight
                    className={styles.chainArrow}
                    size={17}
                    aria-hidden="true"
                  />
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>
      <Journey />
      <BeyondEngineering />
      <ExperienceArchive />
      <section
        id="skills"
        className={`section skills-section ${styles.skills}`}
        aria-labelledby="skills-heading"
      >
        <div className={styles.container}>
          <div className={`section-header ${styles.heading}`}>
            <h2 id="skills-heading">
              My Skill Tree
            </h2>
            <p className={styles.headingDescription}>
              Explore the tools, then see
              <br />
              where they become real projects.
            </p>
          </div>
          <SkillsTreeSection />
        </div>
      </section>
      <CertificateGallery items={getCertificates()} slots={getCertificateSlots()} />
      <ResearchJournal />
      <section
        id="contact"
        className={`section contact-section ${styles.contact}`}
        aria-labelledby="contact-heading"
      >
        <div className={styles.container}>
          <div className={styles.contactGrid}>
            <div className={`contact-copy ${styles.contactCopy}`}>
              <ContactHeading />
              <p>{site.contactCopy}</p>
              <div className={styles.contactLinks}>
                <a className={styles.email} href={`mailto:${site.email}`}>
                  {site.email}
                  <ArrowUpRight size={14} aria-hidden="true" />
                </a>
                {[
                  { label: "GitHub", href: site.github, path: siGithub.path },
                  { label: "LinkedIn", href: site.linkedin, path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.049c.476-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" },
                ]
                  .filter((link) => link.href)
                  .map((link) => (
                    <a key={link.label} href={link.href} target="_blank" rel="noreferrer" aria-label={link.label} title={link.label}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d={link.path} />
                      </svg>
                      <ArrowUpRight size={12} aria-hidden="true" />
                    </a>
                  ))}
              </div>
            </div>
            <LiquidGlassPanel>
              <p className={styles.formLabel}>
                START A CONVERSATION
              </p>
              <ContactForm email={site.email} note={site.contactNote} />
            </LiquidGlassPanel>
          </div>
        </div>
      </section>
    </div>
  );
}
