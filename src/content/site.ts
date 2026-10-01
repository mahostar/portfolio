// Identity and biography: CVs/cv formation.pdf, CVs/cv.pdf and
// CVs/CVs_data_presentation.md §9. Preferred public name: Wassim.
export const site = {
  placeholder: false,
  firstName: "Wassim",
  lastName: "Mbarek",
  fullName: "Mouhamed Wassim Mbarek",
  roleLabel: "Embedded / Edge AI Engineer",
  tagline: "From circuits to software.\nBuilding the whole chain.",
  careerStartYear: 2021 as number | null,
  location: "Mahdia, Tunisia",
  openTo: "Embedded systems, edge AI & product engineering",
  email: "medwassimmbarek@gmail.com",
  github: "https://github.com/mahostar",
  linkedin: "https://www.linkedin.com/in/mouhamed-wassim-mbarek-b09601334/",
  heroTags: ["IoT", "AI", "Robotics", "PCB"],
  aboutText: "I’m Wassim, a computer engineering graduate specializing in IoT and embedded systems. I build across the full chain: electronics, firmware, data, models, and the software around them. My work includes face anti-spoofing, brain–computer interface prototypes, connected hardware, and hydroponic systems. At FabLab Mahdia, I prototype embedded systems and teach AI, PCB design, and robotics. I like taking an idea all the way to something I can assemble, test, and explain.",
  aboutHeading: "From the circuit\nto the complete system.",
  aboutNote: "Electronics → firmware → models → working products.",
  contactHeading: "Let’s build\nsomething useful.",
  contactCopy: "Have an embedded system, an AI project, or a product to build? Tell me what you’re working on.",
  contactNote: "You can also reach me directly by email.",
  projectsIntro: "Embedded hardware, machine learning, and software built around real problems.",
  heroBg: "/images/hero-bg.webp",
  heroBgMobile: "/images/hero-bg-mobile.webp",
  portrait: "/images/portrait.webp",
};

export const monogram = `${site.firstName.charAt(0)}${site.lastName.charAt(0)}`;
export const fullName = site.fullName;
const netlifyUrl = process.env.NETLIFY === "true"
  ? (process.env.CONTEXT === "production" ? process.env.URL : process.env.DEPLOY_PRIME_URL || process.env.URL)
  : undefined;
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || netlifyUrl || "http://localhost:3000";
