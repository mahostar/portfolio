import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { getProjects } from "@/lib/content";
import { fullName } from "@/content/site";
import { categoryColors } from "@/components/project-schematic";
export const alt = "Engineering project case study";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default async function ProjectImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProjects().find((item) => item.slug === slug);
  if (!project) notFound();
  const accent = categoryColors[project.category] || "#9bd2ff";
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        padding: 70,
        background: "#050d26",
        color: "white",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 19,
          color: accent,
          letterSpacing: 2,
        }}
      >
        <span>{project.category.toUpperCase()}</span>
        <span>{project.year}</span>
      </div>
      <div
        style={{
          fontSize: 82,
          fontWeight: 800,
          letterSpacing: -3,
          lineHeight: 1.07,
          marginTop: 60,
        }}
      >
        {project.title}
      </div>
      <div
        style={{
          fontSize: 26,
          color: "#afc3e6",
          marginTop: 22,
          maxWidth: 960,
          lineHeight: 1.5,
        }}
      >
        {project.summary}
      </div>
      <div style={{ display: "flex", gap: 22, marginTop: 40 }}>
        {project.pipeline.map((label) => (
          <div
            key={label}
            style={{
              display: "flex",
              alignItems: "center",
              border: `1px solid ${accent}`,
              borderRadius: 5,
              padding: "13px 23px",
              fontSize: 18,
              color: accent,
            }}
          >
            {label}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", marginTop: "auto", fontSize: 18, color: "#9bd2ff" }}>
        {fullName} / SELECTED WORK
      </div>
    </div>,
    size,
  );
}
