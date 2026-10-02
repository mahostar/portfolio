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
import {
  getProjects,
  getSite,
  getCertificates,
  getCertificateSlots,
  getTechnologies,
} from "@/lib/content";
import { ProjectCard } from "./project-card";
import { Journey, BeyondEngineering } from "./story-sections";
import { ExperienceArchive } from "./experience-archive";
import { CertificateGallery } from "./certificate-gallery";
import { ContactForm } from "./contact-form";
import { SkillsTreeSection } from "./skills-tree-section";
import { SignalControls } from "./signal-controls";
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
  const featured = projects.filter((project) => project.featured);
  return (
    <div className={`${styles.site} ${mono.variable}`} data-signal-site>
      <SignalControls />
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
          <div className={styles.sectionMeta}>
            <span>02 / BEHIND THE WORK</span>
            <span>MAHDIA, TUNISIA</span>
          </div>
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
          <div className={styles.sectionMeta}>
            <span>06 / THE TOOLKIT</span>
            <span>{getTechnologies().length} TOOLS · 5 DOMAINS</span>
          </div>
          <div className={`section-header ${styles.heading}`}>
            <h2 id="skills-heading">
              One builder.
              <br />
              <span>The whole stack.</span>
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
      <section
        id="contact"
        className={`section contact-section ${styles.contact}`}
        aria-labelledby="contact-heading"
      >
        <div className={styles.container}>
          <div className={styles.sectionMeta}>
            <span>08 / LET’S CONNECT</span>
            <span>THE NEXT SIGNAL</span>
          </div>
          <div className={styles.contactGrid}>
            <div className={`contact-copy ${styles.contactCopy}`}>
              <h2 id="contact-heading">
                Let’s build
                <br />
                <span>
                  something
                  <br />
                  that works.
                </span>
              </h2>
              <p>{site.contactCopy}</p>
              <a className={styles.email} href={`mailto:${site.email}`}>
                {site.email}
                <ArrowUpRight size={18} />
              </a>
              <div className={styles.socials}>
                {[
                  { label: "GitHub", href: site.github },
                  { label: "LinkedIn", href: site.linkedin },
                ]
                  .filter((link) => link.href)
                  .map((link) => (
                    <a key={link.label} href={link.href} target="_blank" rel="noreferrer">
                      {link.label}
                      <ArrowUpRight size={14} />
                    </a>
                  ))}
              </div>
            </div>
            <div className={styles.formPanel}>
              <p className={styles.formLabel}>
                START A CONVERSATION <span>↗</span>
              </p>
              <ContactForm email={site.email} note={site.contactNote} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
