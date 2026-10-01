import "server-only";
import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import matter from "gray-matter";
import { site } from "@/content/site";
import { technologies } from "@/content/tech";
import { journey, impact, interests, certificates, certificateSlots, archive } from "@/content/expansion";
import { projectSchema, siteSchema, techSchema, journeySchema, impactSchema, interestSchema, certificateSchema, certificateSlotSchema, archiveEntrySchema } from "./content-schema";

export const getSite = cache(() => siteSchema.parse(site));
export const getTechnologies = cache(() => technologies.map((item) => techSchema.parse(item)));
export const getJourney = cache(() => journey.map((item) => journeySchema.parse(item)));
export const getImpact = cache(() => impact.map((item) => impactSchema.parse(item)));
export const getInterests = cache(() => interests.map((item) => interestSchema.parse(item)));
export const getCertificates = cache(() => certificates.map((item) => certificateSchema.parse(item)));
export const getCertificateSlots = cache(() => certificateSlots.map((item) => certificateSlotSchema.parse(item)));
export const getArchive = cache(() => archive.map((item) => archiveEntrySchema.parse(item)));
export const getProjects = cache(() => {
  const directory = path.join(process.cwd(), "src/content/projects");
  return fs.readdirSync(directory).filter((file) => file.endsWith(".mdx")).map((file) => {
    const { data, content } = matter(fs.readFileSync(path.join(directory, file), "utf8"));
    return { ...projectSchema.parse(data), body: content };
  }).sort((a, b) => Number(b.featured) - Number(a.featured) || (a.featuredOrder ?? Infinity) - (b.featuredOrder ?? Infinity) || b.year - a.year);
});
export const hasCv = () => fs.existsSync(path.join(process.cwd(), "public/cv.pdf"));
