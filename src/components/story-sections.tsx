import Link from "next/link";
import { ArrowUpRight, Film, Gamepad2, Waves, Wind } from "lucide-react";
import { getInterests, getJourney } from "@/lib/content";
import { Eyebrow } from "./section-heading";

export function Journey() {
  return (
    <section
      id="journey"
      className="section journey-section"
      aria-labelledby="journey-heading"
    >
      <div className="container journey-grid">
        <div className="journey-intro">
          <Eyebrow>03 / Building my own path</Eyebrow>
          <h2 id="journey-heading" className="large-heading">
            My Journey
          </h2>
          <p>
            From studying systems to building them, teaching them, and leading the work.
          </p>
          <p className="journey-note">
            The roles in 2025–2026 overlapped: an intensive chapter of engineering,
            teaching, and leadership.
          </p>
        </div>
        <ol className="journey-list">
          {getJourney().map((item, index) => (
            <li
              key={item.id}
              className={item.kind === "Planned" ? "journey-planned" : ""}
            >
              <span className="journey-index" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="journey-entry">
                <div className="journey-meta">
                  <span>{item.period}</span>
                  <span className="story-badge">{item.kind}</span>
                </div>
                <h3>{item.title}</h3>
                <p className="journey-organization">{item.organization}</p>
                <p>{item.description}</p>
                {item.href && (
                  <Link
                    className="text-link"
                    href={item.href}
                    {...(item.href.startsWith("https:")
                      ? { target: "_blank", rel: "noreferrer" }
                      : {})}
                  >
                    {item.linkLabel}
                    <ArrowUpRight size={16} />
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

const interestIcons = {
  windsurfing: Wind,
  swimming: Waves,
  gaming: Gamepad2,
  cinema: Film,
};
export function BeyondEngineering() {
  return (
    <section
      id="interests"
      className="section interests-section"
      aria-labelledby="interests-heading"
    >
      <div className="container">
        <div className="story-heading">
          <div>
            <Eyebrow>04 / Away from the workbench</Eyebrow>
            <h2 id="interests-heading">Beyond Engineering</h2>
          </div>
        </div>
        <div className="interests-grid">
          {getInterests().map((item) => {
            const Icon = interestIcons[item.id];
            return (
              <article className={`interest-card interest-${item.id}`} key={item.id}>
                <span className="interest-number" aria-hidden="true">
                  {item.id === "windsurfing"
                    ? "08"
                    : item.id === "swimming"
                      ? "05"
                      : item.id === "gaming"
                        ? "∞"
                        : "▶"}
                </span>
                <div className="interest-icon" aria-hidden="true">
                  <Icon size={32} strokeWidth={1.5} />
                </div>
                <p className="interest-detail">{item.detail}</p>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                {item.id === "windsurfing" && (
                  <svg className="interest-waves" viewBox="0 0 400 30" aria-hidden="true">
                    <path d="M0 18 Q25 0 50 18 T100 18 T150 18 T200 18 T250 18 T300 18 T350 18 T400 18" />
                    <path d="M0 24 Q25 6 50 24 T100 24 T150 24 T200 24 T250 24 T300 24 T350 24 T400 24" />
                  </svg>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
