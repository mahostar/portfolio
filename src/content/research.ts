// Dates supplied by the author; descriptions grounded in the PDF abstracts.
export const researchPapers = [
  {
    slug: "easyshield",
    title: "EasyShield v2.5: Real-Time Face Anti-Spoofing",
    date: "November 2025",
    dateTime: "2025-11",
    kind: "",
    description:
      "A lightweight RGB model for detecting printed-photo and video-replay attacks on edge devices.",
    file: "/research/easyshield-v2-5.pdf",
    logo: "/images/research/easyshield-logo.webp",
  },
  {
    slug: "ai-overwhelm",
    title: "Where Does “I Am Overwhelmed” Come From in AI?",
    date: "October 2026",
    dateTime: "2026-10",
    kind: "Independent Position Paper",
    description:
      "AI emotional self-reports: learned narratives, functional states, or potentially felt states.",
    file: "/research/ai-overwhelm.pdf",
    logo: "/images/research/ai-overwhelm-logo.webp",
  },
] as const;

export type ResearchPaper = (typeof researchPapers)[number];
