import evidenceStories from "./evidence-stories.json" with { type: "json" };
const { milestoneStories, evidenceCertificates } = evidenceStories;
// Owner-confirmed content. Year ranges intentionally preserve overlapping roles.
// Add only selected public images here; private study scans stay in remainn/.
export const journey = [
  { id: "isima", period: "2022–2025", kind: "Education", title: "Computer Engineering degree", organization: "ISIMA Mahdia · Embedded Systems & IoT", description: "Three years of study, completed in June 2025. My final-year project, NiotoShield, combined hardware and software. EasyShield grew from its AI work.", href: "/projects/niotoshield", linkLabel: "Explore NiotoShield" },
  { id: "fablab", period: "2025–2026", kind: "Teaching & engineering", title: "Embedded Systems Engineer & Trainer", organization: "FabLab Mahdia", description: "Created and taught practical courses in Arduino robotics, PCB design, and AI, connecting engineering concepts with hands-on projects." },
  { id: "plantini", period: "2025–2026", kind: "Technical leadership", title: "CTO · Plantini", organization: "Agricultural technology startup", description: "Took on technical leadership at Plantini, bringing my embedded systems and software background to the startup’s development." },
  { id: "katek", period: "2025–2026", kind: "Company leadership", title: "Former CEO · KaTEK", organization: "Software development company · now closed", description: "Led a software development company, with responsibility for technical work and business leadership. A completed chapter in my experience building and leading." },
  { id: "romania", period: "Next chapter", kind: "Planned", title: "Advanced Computing in Embedded Systems", organization: "POLITEHNICA Bucharest · Romania", description: "Planning an English-taught master’s degree at the Faculty of Electronics, Telecommunications and Information Technology, with a focus on embedded computing, parallel systems, and FPGA acceleration.", href: "https://etti.upb.ro/2024/12/02/advanced-computing-in-embedded-systems/", linkLabel: "About the program" },
];

export const impact = [
  { id: "robotics", category: "Teaching / Robotics", title: "From a first circuit to a working robot.", description: "At FabLab Mahdia, I created robotics courses and taught Arduino through practical building. A place to connect the code, the circuit, and the idea.", image: null, alt: "", photoLabel: "Robotics workshop photos coming soon", motif: "robotics" },
  { id: "ai", category: "Teaching / Artificial intelligence", title: "Making AI something you can build with.", description: "I developed and taught AI courses at FabLab, sharing the tools and ideas behind my own engineering projects.", image: null, alt: "", photoLabel: "AI course photos coming soon", motif: "ai" },
  { id: "pcb", category: "Teaching / Electronics", title: "Turning circuit ideas into PCB designs.", description: "PCB design training brought another part of the engineering process into the classroom: designing the hardware behind a working system.", image: null, alt: "", photoLabel: "PCB training photos coming soon", motif: "pcb" },
];

export const interests = [
  { id: "windsurfing", title: "Windsurfing", detail: "8 years on the water", description: "I’ve been windsurfing for eight years, developing advanced skills and a feel for the wind and water." },
  { id: "swimming", title: "Swimming", detail: "5 years of special training", description: "Five years of dedicated swimming training. The water has always been a big part of my life." },
  { id: "gaming", title: "Gaming", detail: "Time to play", description: "I enjoy getting into a game and spending time in the worlds people build." },
  { id: "cinema", title: "Movies & TV shows", detail: "A different kind of story", description: "When I step away from a project, I like watching movies and following a good series." },
];

// IELTS is retained from the existing verified content; its public scan is pending.
// Empty slots are layout previews, not credentials or awards being claimed.
export const certificates = evidenceCertificates;
export const certificateSlots = [];

// This is the visual record of the work: workshop photos, project moments, and
// short videos belong here. It is intentionally separate from formal certificates.
export const archive = milestoneStories;
