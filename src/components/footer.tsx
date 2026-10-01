import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { site, monogram } from "@/content/site";
import { hasCv } from "@/lib/content";

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
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-intro">
            <Link
              href="/#home"
              className="monogram"
              aria-label={`${site.fullName} — Return to home`}
            >
              {monogram}
              <span className="monogram-dot" />
            </Link>
            <h2>
              Med Wassim
              <br />
              Mbarek<span className="footer-dot">.</span>
            </h2>
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
              <br />
              I’d like to hear about it.
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
            © {new Date().getFullYear()} {site.fullName}
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
