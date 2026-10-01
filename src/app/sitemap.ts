import type { MetadataRoute } from "next";
import { site, siteUrl } from "@/content/site";
import { getProjects } from "@/lib/content";
export default function sitemap(): MetadataRoute.Sitemap {
  if (site.placeholder) return [];
  return [
    { url: siteUrl, priority: 1 },
    { url: `${siteUrl}/projects`, priority: 0.8 },
    ...getProjects()
      .filter((project) => !project.placeholder)
      .map((project) => ({ url: `${siteUrl}/projects/${project.slug}`, priority: 0.7 })),
  ];
}
