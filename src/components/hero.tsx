import Image, { getImageProps } from "next/image";
import Link from "next/link";
import { ArrowDownRight, Download } from "lucide-react";
import type { CSSProperties } from "react";
import { getSite, getProjects, getTechnologies, hasCv } from "@/lib/content";
import { getStats } from "@/lib/content-schema";
import { HeroStage, type HeroProof } from "./hero/HeroStage";
import { PersonalTicker } from "./personal-ticker";

export function Hero() {
  const site = getSite(),
    projects = getProjects(),
    tools = getTechnologies();
  const stats = getStats(projects, site.careerStartYear);
  const proof = (
    anchor: HeroProof["anchor"],
    label: string,
    ids: string[],
    category?: string,
  ): HeroProof => {
    const project = projects.find(
      (project) =>
        !project.placeholder &&
        (!category || project.category.includes(category)) &&
        ids.some((id) => project.tech.includes(id)),
    );
    const tool =
      project &&
      tools.find((tool) => ids.includes(tool.id) && project.tech.includes(tool.id));
    return {
      anchor,
      label,
      text:
        project && tool
          ? tool.name + " in " + project.title
          : "TODO(owner): link a robotics project.",
      ...(project ? { href: "/projects/" + project.slug } : {}),
    };
  };
  const proofs = [
    proof("io", "IoT", ["espressif"]),
    proof("ai", "AI", ["pytorch", "tensorflow", "opencv"]),
    proof("pcb", "PCB", ["pcb"], "Electronics"),
    proof("robotics", "Robotics", ["arduino", "espressif"], "Robotics"),
  ];
  const desktop = getImageProps({
    src: site.heroBg,
    alt: "",
    fill: true,
    sizes: "(min-width: 1440px) 1440px, 100vw",
  }).props;
  const mobile = getImageProps({
    src: site.heroBgMobile,
    alt: "",
    fill: true,
    sizes: "100vw",
  }).props;
  return (
    <section id="home" className="hero" aria-labelledby="hero-name">
      <link
        rel="preload"
        as="image"
        href="/images/hero-traces-mask.webp"
        media="(min-width: 1024px)"
        fetchPriority="auto"
      />
      <link
        rel="preload"
        as="image"
        href="/images/hero-traces-mask-mobile.webp"
        media="(max-width: 1023px)"
        fetchPriority="auto"
      />
      <HeroStage
        proofs={proofs}
        background={
          <picture>
            <source
              media="(min-width: 1024px)"
              srcSet={desktop.srcSet}
              sizes={desktop.sizes}
            />
            <img {...mobile} alt="" loading="eager" fetchPriority="high" />
          </picture>
        }
        portrait={
          <Image
            src={site.portrait}
            alt={site.fullName + ", embedded and edge AI engineer"}
            fill
            loading="eager"
            fetchPriority="auto"
            sizes="(max-width: 1023px) 60vw, 460px"
          />
        }
        copy={
          <div
            className="hero-copy"
            style={
              {
                "--name-length": Math.max(site.firstName.length, site.lastName.length, 7),
              } as CSSProperties
            }
          >
            <p className="eyebrow hero-role">{site.roleLabel}</p>
            <p className="hero-greeting">{site.greeting}</p>
            <h1 id="hero-name" aria-label={site.greeting + " " + site.fullName}>
              <span className="name-outline" data-text={site.firstName}>
                {site.firstName}
              </span>
              <span className="name-solid">
                {site.lastName}
                <span className="name-period" aria-hidden="true">
                  .
                </span>
              </span>
            </h1>
            <div className="hero-rule" />
            <p className="hero-tagline">{site.tagline}</p>
          </div>
        }
        bottom={
          <div className="hero-bottom">
            <dl className="hero-stats">
              <div>
                <dt>
                  Projects
                  <br />
                  built
                </dt>
                <dd>
                  <span data-count={stats.projects}>{stats.projects}</span>
                </dd>
              </div>
              <div>
                <dt>
                  Years
                  <br />
                  building
                </dt>
                <dd>
                  <span data-count={stats.years ?? undefined}>{stats.years ?? "—"}</span>
                  {!!stats.years && <span className="stat-plus">+</span>}
                </dd>
              </div>
              <div>
                <dt>
                  Technologies
                  <br />
                  used
                </dt>
                <dd>
                  <span data-count={tools.filter((tool) => !tool.placeholder).length}>
                    {tools.filter((tool) => !tool.placeholder).length}
                  </span>
                </dd>
              </div>
            </dl>
            <div className="hero-actions">
              <Link href="#work" className="hero-project-link">
                View projects
                <ArrowDownRight size={18} />
              </Link>
              {hasCv() && (
                <a className="cv-link" href="/cv.pdf" download>
                  Download CV
                  <Download size={16} />
                </a>
              )}
            </div>
          </div>
        }
      />
      <PersonalTicker phrases={site.tickerPhrases} />
    </section>
  );
}
