// Identity and biography: CVs/cv formation.pdf, CVs/cv.pdf and
// Public identity and biography confirmed by the owner in the expansion request.
export const site = {
  placeholder: false,
  firstName: "Med Wassim",
  lastName: "Mbarek",
  fullName: "Med Wassim Mbarek",
  greeting: "Hi, I'm",
  initials: "WM",
  roleLabel: "Embedded / Edge AI Engineer",
  tagline: "From circuits to software.\nBuilding the whole chain.",
  careerStartYear: 2021 as number | null,
  location: "Mahdia, Tunisia",
  openTo: "Embedded systems, edge AI & product engineering",
  email: "medwassimmbarek@gmail.com",
  github: "https://github.com/mahostar",
  linkedin: "https://www.linkedin.com/in/mouhamed-wassim-mbarek-b09601334/",
  heroTags: ["IoT", "AI", "Robotics", "PCB"],
  tickerPhrases: [
    "Engineer. Builder. Educator.",
    "From circuits to software",
    "Embedded systems & edge AI",
    "Robotics, PCB design & AI training",
    "Ideas turned into working systems",
    "Eight years on the windsurf board",
  ],
  aboutText:
    "I’m Med Wassim Mbarek, a computer engineering graduate from ISIMA Mahdia, specializing in embedded systems and IoT. I build across electronics, firmware, AI, and software. After graduating in June 2025, I developed robotics, PCB design, and AI courses at FabLab Mahdia, took on technical leadership at Plantini, and led software development at KaTEK. These overlapping roles made for an intensive year of building and teaching. My next academic chapter is a planned master’s degree in Advanced Computing in Embedded Systems in Romania. I like taking an idea all the way to something I can assemble, test, and explain.",
  aboutHeading: "From the circuit\nto the complete system.",
  aboutNote: "Electronics → firmware → models → working products.",
  contactHeading: "Let’s build",
  contactCopy:
    "Have an embedded system, an AI project, or a product to build? Tell me what you’re working on.",
  contactNote: "",
  projectsIntro:
    "Embedded hardware, machine learning, and software built around real problems.",
  heroBg: "/images/hero-bg.webp",
  heroBgMobile: "/images/hero-bg-mobile.webp",
  portrait: "/images/portrait.webp",
};

export const monogram = site.initials;
// Normalized against the committed crops, not the viewport. J1 is the UART
// header; U3 is the central QFP; L1 is the regulator/driver area.
export const heroAnchors = {
  desktop: {
    chip: { u: 1510 / 1983, v: 412 / 793 },
    io: { u: 1038 / 1983, v: 218 / 793 },
    ai: { u: 1432 / 1983, v: 388 / 793 },
    pcb: { u: 1293 / 1983, v: 545 / 793 },
    robotics: { u: 1765 / 1983, v: 80 / 793 },
  },
  mobile: {
    chip: { u: (1510 - 960) / 1023, v: 412 / 793 },
    io: { u: (1038 - 960) / 1023, v: 218 / 793 },
    ai: { u: (1432 - 960) / 1023, v: 388 / 793 },
    pcb: { u: (1293 - 960) / 1023, v: 545 / 793 },
    robotics: { u: (1765 - 960) / 1023, v: 80 / 793 },
  },
} as const;
export const fullName = site.fullName;
const netlifyUrl =
  process.env.NETLIFY === "true"
    ? process.env.CONTEXT === "production"
      ? process.env.URL
      : process.env.DEPLOY_PRIME_URL || process.env.URL
    : undefined;
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || netlifyUrl || "http://localhost:3000";
