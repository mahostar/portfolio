import "server-only";
import { cache } from "react";
import bundledContent from "@/content/bundled-projects.json";
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

// Catalogue order is intentional. Keep the remaining projects in their existing order,
// then close with the selected four projects.
const catalogueOrder = [
  "easyshield",
  "plantini",
  "niotoshield",
  "aquaflow",
  "cyclops",
  "smarthart",
  "remote-pc-power",
  "movinight",
  "shrinkify",
  "tpms-generator",
  "algobrain",
  "cleenolve",
  "eazycode",
  "faza3d",
];
const catalogueRank = new Map(catalogueOrder.map((slug, index) => [slug, index]));

export const getProjects = cache(() => {
  return bundledContent.projects.map(({ data, body }) => {
    return { ...projectSchema.parse(data), body };
  }).sort((a, b) =>
    (catalogueRank.get(a.slug) ?? Infinity) - (catalogueRank.get(b.slug) ?? Infinity) ||
    Number(b.featured) - Number(a.featured) ||
    (a.featuredOrder ?? Infinity) - (b.featuredOrder ?? Infinity) ||
    (b.year ?? 0) - (a.year ?? 0),
  );
});
export const hasCv = () => bundledContent.hasCv;
