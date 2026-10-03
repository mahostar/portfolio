// Identity and biography: CVs/cv formation.pdf, CVs/cv.pdf and
// Public identity and biography confirmed by the owner in the expansion request.
export const site = {
  placeholder: false,
  firstName: "Mohamed Wassim",
  lastName: "Mbarek",
  fullName: "Mohamed Wassim Mbarek",
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
    "PCB design & analog electronics",
    "Embedded firmware & IoT connectivity",
    "Sensor integration & data acquisition",
    "Automation & actuator control",
    "Computer vision & face anti-spoofing",
    "Multimodal learning & feature fusion",
    "Face recognition & access control",
    "Signal processing & noise filtering",
    "AI retrieval & research pipelines",
    "Thermal imaging & hotspot detection",
    "Mobile apps & cloud integration",
    "Teaching robotics, electronics & AI",
  ],
  aboutText: "I’m Mohamed Wassim Mbarek, a computer engineering graduate from ISIMA Mahdia, specializing in embedded systems and IoT. I build across electronics, firmware, AI, and software. After graduating in June 2025, I developed robotics, PCB design, and AI courses at FabLab Mahdia, took on technical leadership at Plantini, and led software development at KaTEK. These overlapping roles made for an intensive year of building and teaching. My next academic chapter is a planned master’s degree in Advanced Computing in Embedded Systems in Romania. I like taking an idea all the way to something I can assemble, test, and explain.",
  aboutHeading: "From the circuit\nto the complete system.",
  aboutNote: "Electronics → firmware → models → working products.",
  contactHeading: "Let’s build",
  contactCopy: "Have an embedded system, an AI project, or a product to build? Tell me what you’re working on.",
  contactNote: "",
  projectsIntro: "Embedded hardware, machine learning, and software built around real problems.",
  heroBg: "/images/hero-bg.webp",
  heroBgMobile: "/images/hero-bg-mobile.webp",
  portrait: "/images/professional-portrait-cutout.png",
};

export const monogram = site.initials;
export const fullName = site.fullName;
const netlifyUrl = process.env.NETLIFY === "true"
  ? (process.env.CONTEXT === "production" ? process.env.URL : process.env.DEPLOY_PRIME_URL || process.env.URL)
  : undefined;
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || netlifyUrl || (process.env.NODE_ENV === "production"
  ? "https://mohamedwassimmbarek.darkcompiler.workers.dev"
  : "http://localhost:3000");
