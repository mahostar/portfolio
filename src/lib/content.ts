import "server-only";
import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import matter from "gray-matter";
import { site } from "@/content/site";
import { technologies } from "@/content/tech";
import { timeline } from "@/content/timeline";
import { projectSchema, siteSchema, techSchema, timelineSchema } from "./content-schema";

export const getSite = cache(() => siteSchema.parse(site));
export const getTechnologies = cache(() => technologies.map((item) => techSchema.parse(item)));
export const getTimeline = cache(() => timeline.map((item) => timelineSchema.parse(item)).sort((a, b) => b.date.localeCompare(a.date)));
export const getProjects = cache(() => {
  const directory = path.join(process.cwd(), "src/content/projects");
  return fs.readdirSync(directory).filter((file) => file.endsWith(".mdx")).map((file) => {
    const { data, content } = matter(fs.readFileSync(path.join(directory, file), "utf8"));
    return { ...projectSchema.parse(data), body: content };
  }).sort((a, b) => Number(b.featured) - Number(a.featured) || (a.featuredOrder ?? Infinity) - (b.featuredOrder ?? Infinity) || b.year - a.year);
});
export const hasCv = () => fs.existsSync(path.join(process.cwd(), "public/cv.pdf"));
