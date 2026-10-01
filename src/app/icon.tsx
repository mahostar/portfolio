import { ImageResponse } from "next/og";
import { monogram } from "@/content/site";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";
export default function Icon() {
  return new ImageResponse(<div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", borderRadius: 14, background: "#1F3BFF", color: "white", fontWeight: 900, fontSize: 32, letterSpacing: -2 }}>{monogram}</div>, size);
}
