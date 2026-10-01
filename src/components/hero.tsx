import Image, { getImageProps } from "next/image";
import Link from "next/link";
import { ArrowDownRight, Download } from "lucide-react";
import type { CSSProperties } from "react";
import { getSite, getProjects, hasCv } from "@/lib/content";
import { getStats } from "@/lib/content-schema";
import { HeroMotion } from "./hero-motion";
import { HeroCircuit } from "./hero-circuit";
import { PersonalTicker } from "./personal-ticker";

export function Hero() {
  const site = getSite();
  const stats = getStats(getProjects(), site.careerStartYear);
  const desktop = getImageProps({
    src: site.heroBg,
    alt: "",
    fill: true,
    sizes: "100vw",
    loading: "eager",
    fetchPriority: "high",
  }).props;
  const mobile = getImageProps({
    src: site.heroBgMobile,
    alt: "",
    fill: true,
    sizes: "100vw",
    loading: "eager",
    fetchPriority: "high",
  }).props;
  return (
    <section id="home" className="hero" aria-labelledby="hero-name">
      <HeroMotion>
        <div className="hero-background">
          <picture>
            <source
              media="(min-width: 768px)"
              srcSet={desktop.srcSet}
              sizes={desktop.sizes}
            />
            {/* getImageProps supplies optimized responsive URLs without downloading both crops. */}
            <img {...mobile} alt="" />
          </picture>
        </div>
        <div className="hero-color-wash" />
        <HeroCircuit />
        <div className="container hero-inner">
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
            <h1 id="hero-name" aria-label={`${site.greeting} ${site.fullName}`}>
              <span className="name-outline" data-text={site.firstName}>
                {site.firstName}
              </span>
              <span className="name-solid" data-text={site.lastName}>
                {site.lastName}
                <span className="name-period" aria-hidden="true">
                  .
                </span>
              </span>
            </h1>
            <div className="hero-rule" />
            <p className="hero-tagline">{site.tagline}</p>
          </div>
          <div className="portrait-region">
            <div className="hero-bloom" />
            <svg
              className="portrait-blueprint"
              viewBox="0 0 520 520"
              fill="none"
              aria-hidden="true"
            >
              <g className="blueprint-plane plane-back">
                <path d="M40 254 260 122 480 254 260 386Z" />
                <path d="m40 254 220 132 220-132M260 122v264" strokeDasharray="3 8" />
              </g>
              <g className="blueprint-plane plane-middle">
                <path d="M40 296 260 164 480 296 260 428Z" />
                <path d="M95 263v66m330-66v66M150 230v132m220-132v132" />
              </g>
              <g className="blueprint-plane plane-front">
                <path d="M40 338 260 206 480 338 260 470Z" />
                <path d="m40 338-24 14v58m464-72 24 14v58M260 470v28" />
                <circle cx="16" cy="415" r="5" />
                <circle cx="504" cy="415" r="5" />
                <circle cx="260" cy="503" r="5" />
              </g>
              <path
                className="blueprint-pulse"
                pathLength="100"
                d="M16 410v-58l244-146 244 146v58"
              />
            </svg>
            <div className="portrait">
              <Image
                src={site.portrait}
                alt={`${site.fullName}, embedded and edge AI engineer`}
                fill
                preload
                sizes="(max-width: 767px) 100vw, (max-width: 1300px) 45vw, 550px"
              />
            </div>
            <div className="stickers" aria-hidden="true">
              {site.heroTags.map((tag, index) => (
                <span key={tag} className={`sticker sticker-${index}`}>
                  <span>{tag}</span>
                  <svg className="sticker-connector" viewBox="0 0 44 26" fill="none">
                    <path d={index > 1 ? "M0 13H13L37 3" : "M0 13H13L37 23"} />
                    <circle cx="37" cy={index > 1 ? 3 : 23} r="3" />
                  </svg>
                </span>
              ))}
            </div>
          </div>
          <div className="hero-bottom">
            <dl className="hero-stats">
              <div>
                <dt>
                  Projects
                  <br />
                  built
                </dt>
                <dd>
                  {stats.projects}
                  <span className="stat-plus">{stats.projects > 0 ? "+" : ""}</span>
                </dd>
              </div>
              <div>
                <dt>
                  Years
                  <br />
                  building
                </dt>
                <dd>
                  {stats.years ?? "—"}
                  <span className="stat-plus">{stats.years ? "+" : ""}</span>
                </dd>
              </div>
              <div>
                <dt>
                  Technologies
                  <br />
                  used
                </dt>
                <dd>
                  {stats.technologies}
                  <span className="stat-plus">{stats.technologies > 0 ? "+" : ""}</span>
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
        </div>
      </HeroMotion>
      <PersonalTicker phrases={site.tickerPhrases} />
    </section>
  );
}
