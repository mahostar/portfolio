import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fullName, site } from "@/content/site";
export const alt = `${fullName} — ${site.roleLabel}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default async function OpenGraphImage() {
  const portrait = await readFile(
    path.join(process.cwd(), "public/images/share-portrait.jpg"),
  );
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        background: "#0139b4",
        color: "white",
        position: "relative",
        padding: "65px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          width: "700px",
          position: "relative",
        }}
      >
        <div
          style={{ fontSize: 18, letterSpacing: 4, color: "#9bd2ff", marginBottom: 35 }}
        >
          CIRCUITS → FIRMWARE → AI → PRODUCT
        </div>
        <div
          style={{
            fontSize: 83,
            fontWeight: 900,
            lineHeight: 1.03,
            letterSpacing: -3,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <span>{site.firstName}</span>
          <span>
            {site.lastName}
            <span style={{ color: "#ffd400" }}>.</span>
          </span>
        </div>
        <div style={{ fontSize: 25, marginTop: 28, color: "#d4e8ff" }}>
          {site.roleLabel}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 40,
            width: 70,
            height: 5,
            background: "#ffd400",
          }}
        />
      </div>
      {/* ImageResponse needs a native image with explicit dimensions. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`data:image/jpeg;base64,${portrait.toString("base64")}`}
        width={430}
        height={457}
        alt=""
        style={{ position: "absolute", right: 20, bottom: 0, objectFit: "contain" }}
      />
    </div>,
    size,
  );
}
