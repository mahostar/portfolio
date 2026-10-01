import Image, { getImageProps } from "next/image";
import Link from "next/link";
import { ArrowDownRight, Download } from "lucide-react";
import type { CSSProperties } from "react";
import { getSite, getProjects, hasCv } from "@/lib/content";
import { getStats } from "@/lib/content-schema";
import { HeroMotion } from "./hero-motion";

export function Hero() {
  const site = getSite();
  const stats = getStats(getProjects(), site.careerStartYear);
  const desktop = getImageProps({ src: site.heroBg, alt: "", fill: true, sizes: "100vw", loading: "eager", fetchPriority: "high" }).props;
  const mobile = getImageProps({ src: site.heroBgMobile, alt: "", fill: true, sizes: "100vw", loading: "eager", fetchPriority: "high" }).props;
  return <section id="home" className="hero" aria-labelledby="hero-name">
    <HeroMotion>
      <div className="hero-background"><picture><source media="(min-width: 768px)" srcSet={desktop.srcSet} sizes={desktop.sizes} />{/* getImageProps supplies optimized responsive URLs without downloading both crops. */}<img {...mobile} alt="" /></picture></div>
      <div className="hero-color-wash" />
      <div className="container hero-inner">
        <div className="hero-copy" style={{ "--name-length": Math.max(site.firstName.length, site.lastName.length, 7) } as CSSProperties}>
          <p className="eyebrow hero-role">{site.roleLabel}</p>
          <h1 id="hero-name" aria-label={site.fullName}><span>{site.firstName}</span><span>{site.lastName}</span></h1>
          <div className="hero-rule" />
          <p className="hero-tagline">{site.tagline}</p>
        </div>
        <div className="portrait-region">
          <div className="hero-bloom" />
          <div className="portrait"><Image src={site.portrait} alt={`${site.fullName}, embedded and edge AI engineer`} fill preload sizes="(max-width: 767px) 100vw, (max-width: 1300px) 45vw, 550px" /></div>
          <div className="stickers" aria-hidden="true">{site.heroTags.map((tag, index) => <span key={tag} className={`sticker sticker-${index}`}><span>{tag}</span><svg className="sticker-connector" viewBox="0 0 44 26" fill="none"><path d="M1 3H13L35 21" /><circle cx="37" cy="22" r="3" /></svg></span>)}</div>
        </div>
        <div className="hero-bottom">
          <dl className="hero-stats">
            <div><dt>Projects<br />built</dt><dd>{stats.projects}<span className="stat-plus">{stats.projects > 0 ? "+" : ""}</span></dd></div>
            <div><dt>Years<br />building</dt><dd>{stats.years ?? "—"}<span className="stat-plus">{stats.years ? "+" : ""}</span></dd></div>
            <div><dt>Technologies<br />used</dt><dd>{stats.technologies}<span className="stat-plus">{stats.technologies > 0 ? "+" : ""}</span></dd></div>
          </dl>
          <div className="hero-actions"><Link href="#work" className="hero-project-link">View projects<ArrowDownRight size={18} /></Link>{hasCv() && <a className="cv-link" href="/cv.pdf" download>Download CV<Download size={16} /></a>}</div>
        </div>
      </div>
    </HeroMotion>
  </section>;
}
