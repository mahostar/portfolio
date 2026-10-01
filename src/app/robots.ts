import type { MetadataRoute } from "next";
import { site, siteUrl } from "@/content/site";
export default function robots(): MetadataRoute.Robots { return { rules: { userAgent: "*", ...(site.placeholder ? { disallow: "/" } : { allow: "/", disallow: "/api/" }) }, sitemap: `${siteUrl}/sitemap.xml` }; }
