import evidence from "@/content/evidence.json";

export type EvidenceItem = (typeof evidence)[number];
export const getProjectEvidence = (slug: string) =>
  evidence.filter((item) => item.tags.includes(`project:${slug}`));
export const getEvidence = (id: string) => evidence.find((item) => item.id === id);
export const getEvidenceGroup = (prefix: string) =>
  evidence.filter((item) => item.folder.startsWith(prefix));
