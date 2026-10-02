import { HomeLink as Link } from "./home-link";
import { ArrowUpRight } from "lucide-react";
import { site } from "@/content/site";
import { siGithub } from "simple-icons";
import { BrandLogo } from "./brand-logo";
import { CopyrightYear } from "./copyright-year";
import { hasCv } from "@/lib/content";
import styles from "./footer.module.css";

const links = [
  ["Work", "work"],
  ["About", "about"],
  ["My Journey", "journey"],
  ["Impact", "impact"],
  ["Skills", "skills"],
  ["Beyond Engineering", "interests"],
  ["Certificates", "certificates"],
  ["Contact", "contact"],
];
export function Footer() {
  return (
    <footer className={`site-footer ${styles.footer}`}>
      <div className="container">
        <div className="footer-grid">
          <div className="footer-intro">
            <Link
              href="/#home"
              className={styles.brand}
              aria-label={`${site.fullName} — Return to home`}
            >
              <BrandLogo />
              <h2>{site.fullName}</h2>
            </Link>
            <p>
              I build across circuits, embedded systems, AI, and software — and share what
              I learn along the way.
            </p>
            <div className="footer-socials">
              {site.github && (
                <a
                  href={site.github}
                  aria-label="GitHub"
                  target="_blank"
                  rel="noreferrer"
                >
                  GitHub
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={siGithub.path} /></svg>
                  <ArrowUpRight size={14} />
                </a>
              )}
              {site.linkedin && (
                <a
                  href={site.linkedin}
                  aria-label="LinkedIn"
                  target="_blank"
                  rel="noreferrer"
                >
                  LinkedIn
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.049c.476-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                  <ArrowUpRight size={14} />
                </a>
              )}
            </div>
          </div>
          <nav className="footer-navigation" aria-label="Footer navigation">
            <h3>Explore</h3>
            <div>
              {links.map(([label, id]) => (
                <Link key={id} href={`/#${id}`}>
                  {label}
                </Link>
              ))}
            </div>
          </nav>
          <div className="footer-contact">
            <h3>Let’s connect</h3>
            <p>
              Have something useful in mind?
              {" "}I’d like to hear about it.
            </p>
            <a href={`mailto:${site.email}`} className="footer-email">
              {site.email}
              <ArrowUpRight size={17} />
            </a>
            <p className="footer-location">{site.location}</p>
            {hasCv() && (
              <a className="text-link" href="/cv.pdf" download>
                Download CV
                <ArrowUpRight size={16} />
              </a>
            )}
          </div>
        </div>
        <div className="footer-bottom">
          <p>
            © <CopyrightYear /> {site.fullName}
          </p>
          <Link href="/#home" className="text-link">
            Back to top
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </footer>
  );
}
