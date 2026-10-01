import { ImageResponse } from "next/og";
import { fullName, site } from "@/content/site";
export const alt = `${fullName} — ${site.roleLabel}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function OpenGraphImage() {
  return new ImageResponse(<div style={{ display: "flex", flexDirection: "column", justifyContent: "center", width: "100%", height: "100%", padding: "80px", background: "#0139B4", color: "white" }}><div style={{ fontSize: 24, letterSpacing: 6, marginBottom: 30 }}>{site.roleLabel.toUpperCase()}</div><div style={{ display: "flex", flexDirection: "column", fontSize: 110, fontWeight: 900, lineHeight: 0.95, letterSpacing: -5 }}><span>{site.firstName}</span><span>{site.lastName}</span></div><div style={{ marginTop: 40, fontSize: 24, maxWidth: 850 }}>{site.tagline.replace(/\n/g, " ")}</div></div>, size);
}
