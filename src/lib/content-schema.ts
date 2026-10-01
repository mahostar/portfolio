import { z } from "zod";

export const bannedWords = ["expert", "master", "mastered", "guru", "passionate", "world-class", "cutting-edge", "innovative", "genius", "best", "rockstar", "ninja", "10x"];
export const sections = ["Problem", "What I built", "How it works", "Result", "What I would improve"];
const localImage = z.string().regex(/^\/images\/[a-zA-Z0-9/_-]+\.(webp|png|jpg|jpeg|svg)$/);
const url = z.url().refine((value) => /^https?:\/\//.test(value), "Use an HTTP or HTTPS URL");
const optionalUrl = z.union([url, z.literal("")]).optional();
export const siteSchema = z.object({
  placeholder: z.boolean(), firstName: z.string().min(1).max(30), lastName: z.string().min(1).max(30), fullName: z.string().min(1),
  roleLabel: z.string().min(1), tagline: z.string().min(1),
  careerStartYear: z.number().int().min(1950).max(new Date().getFullYear()).nullable(),
  location: z.string(), openTo: z.string(), email: z.union([z.email(), z.literal("")]),
  github: optionalUrl, linkedin: optionalUrl,
  heroTags: z.array(z.string()).length(4),
  aboutText: z.string().refine((value) => value.split(/\s+/).length <= 120, "About must have at most 120 words"),
  aboutHeading: z.string().min(1), aboutNote: z.string(), contactHeading: z.string().min(1),
  contactCopy: z.string().min(1), contactNote: z.string(), projectsIntro: z.string(),
  heroBg: localImage, heroBgMobile: localImage, portrait: localImage,
});
export const techSchema = z.object({ id: z.string().regex(/^[a-z0-9-]+$/), name: z.string().min(1), group: z.enum(["Hardware and PCB", "Firmware and IoT", "AI and Agents", "Full-stack", "3D and Design"]), logo: z.string(), placeholder: z.boolean() });
export const timelineSchema = z.object({ date: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/), title: z.string().min(1), issuer: z.string().min(1), type: z.enum(["certification", "achievement", "education"]), url: optionalUrl, placeholder: z.boolean() });
export const projectSchema = z.object({
  title: z.string().min(1), slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  category: z.string().min(1), summary: z.string().min(1).max(100), cover: localImage,
  year: z.number().int().min(2000).max(new Date().getFullYear()),
  tech: z.array(z.string()).min(1), featured: z.boolean(), featuredOrder: z.number().int().positive().optional(),
  links: z.object({ github: optionalUrl, demo: optionalUrl, video: optionalUrl }).default({}),
  role: z.string().min(1), placeholder: z.boolean(),
}).refine((p) => !p.featured || p.featuredOrder !== undefined, { message: "Featured projects require featuredOrder", path: ["featuredOrder"] });
export type Project = z.infer<typeof projectSchema> & { body: string };

export function getStats(projects: Pick<Project, "placeholder" | "tech">[], startYear: number | null, currentYear = new Date().getFullYear()) {
  const realProjects = projects.filter((project) => !project.placeholder);
  return { projects: realProjects.length, years: startYear === null ? null : Math.max(0, currentYear - startYear), technologies: new Set(realProjects.flatMap((project) => project.tech)).size };
}

export function validateEditorial(text: string) {
  return bannedWords.filter((word) => new RegExp(`\\b${word}\\b`, "i").test(text));
}
