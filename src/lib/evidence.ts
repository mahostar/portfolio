import evidence from "@/content/evidence.json";

export type EvidenceItem = (typeof evidence)[number];
// Changing the URL refreshes cached thumbnails and full-size gallery images.
const items = evidence.map((item) => {
  if (!("assetVersion" in item)) return item;
  const version = `?v=${item.assetVersion}`;
  return { ...item, src: item.src + version, preview: item.preview + version, thumbnail: item.thumbnail + version };
});
export const getProjectEvidence = (slug: string) =>
  items.filter((item) => item.tags.includes(`project:${slug}`));
export const getEvidence = (id: string) => items.find((item) => item.id === id);
export const getEvidenceGroup = (prefix: string) =>
  items.filter((item) => item.folder.startsWith(prefix));
