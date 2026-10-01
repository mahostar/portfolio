import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { TechLogo } from "@/components/tech-logo";
import { techGroups } from "@/content/tech";
import { getTechnologies } from "@/lib/content";
import { SkillTree } from "./skill-tree";
import styles from "./skill-tree.module.css";

export const metadata: Metadata = {
  title: "Skills playground",
  description: "An isolated exploration of the portfolio skills section.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/test-dev" },
};

const descriptions: Record<(typeof techGroups)[number], string> = {
  "Hardware and PCB":
    "The physical foundation: designing the boards that connect a system.",
  "Firmware and IoT":
    "Code meets hardware. Microcontrollers, connected devices, and embedded computing.",
  "AI and Agents":
    "Models, computer vision, and the tools behind intelligent applications.",
  "Full-stack": "Interfaces, application logic, and the services that connect them.",
  "3D and Design":
    "From a digital model to a physical part: modelling, CAD, and fabrication.",
};

export default function SkillsPlayground() {
  if (process.env.NODE_ENV === "production") notFound();
  const technologies = getTechnologies();
  const groups = techGroups
    .map((name, index) => ({
      id: `branch-${index}`,
      name,
      description: descriptions[name],
      tools: technologies
        .filter((tech) => tech.group === name)
        .map((tech) => ({
          id: tech.id,
          name: tech.name,
          logo: <TechLogo id={tech.id} withName />,
        })),
    }))
    .filter((group) => group.tools.length);

  return (
    <div className={styles.lab}>
      <header className={styles.labBar}>
        <Link href="/#skills">
          <ArrowLeft size={15} />
          Back to portfolio
        </Link>
        <span>
          <i />
          DESIGN LAB <b>/ 001</b>
        </span>
      </header>
      <section className={styles.section} aria-labelledby="skills-lab-title">
        <div className={styles.heading}>
          <div>
            <p className={styles.eyebrow}>THE TOOLKIT, CONNECTED</p>
            <h1 id="skills-lab-title">
              What I work with<span>.</span>
            </h1>
          </div>
          <p>
            From the circuit to the interface.
            <br />
            Explore the tools behind my work.
          </p>
        </div>
        <SkillTree groups={groups} />
        <footer className={styles.labFooter}>
          <span>
            EXPERIMENT 001 <b>—</b> THE SKILL TREE
          </span>
          <a
            href="https://motion.dev/docs/react-svg-animation"
            target="_blank"
            rel="noreferrer"
          >
            Motion reference
            <ArrowUpRight size={13} />
          </a>
        </footer>
      </section>
    </div>
  );
}
