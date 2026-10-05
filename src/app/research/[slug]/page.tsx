import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { researchPapers } from "@/content/research";
import { ResearchReader } from "@/components/research-reader";

export function generateStaticParams() {
  return researchPapers.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const paper = researchPapers.find((item) => item.slug === slug);
  return {
    title: paper?.title ?? "Research Journal",
    robots: { index: false, follow: true },
    alternates: { canonical: `/research/${slug}` },
  };
}

export default async function ResearchPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const paper = researchPapers.find((item) => item.slug === slug);
  if (!paper) notFound();
  return <ResearchReader key={paper.slug} paper={paper} />;
}
