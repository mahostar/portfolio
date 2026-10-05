import Link from "next/link";
import Image from "next/image";
import { researchPapers } from "@/content/research";
import styles from "./research-journal.module.css";

export function ResearchJournal() {
  return (
    <section
      id="research"
      className={`section ${styles.section}`}
      aria-labelledby="research-heading"
    >
      <div className="container">
        <div className="story-heading">
          <h2 id="research-heading">Research Journal</h2>
          <p>Personal papers, working ideas, and independent investigations.</p>
        </div>
        <div className={styles.cards}>
          {researchPapers.map((paper) => (
            <Link
              key={paper.slug}
              href={`/research/${paper.slug}`}
              className={styles.card}
            >
              <span className={styles.logo} aria-hidden="true">
                <Image src={paper.logo} alt="" width={64} height={64} sizes="64px" />
              </span>
              <div className={styles.copy}>
                <div className={styles.meta}>
                  <time dateTime={paper.dateTime}>{paper.date}</time>
                  {paper.kind && <span>{paper.kind}</span>}
                </div>
                <h3>{paper.title}</h3>
                <p>{paper.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
