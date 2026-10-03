import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import {
  siReact,
  siJavascript,
  siRust,
  siTauri,
  siFfmpeg,
  siPython,
  siCplusplus,
  siTensorflow,
  siEspressif,
  siPytorch,
  siOpencv,
  siArduino,
  siRaspberrypi,
  siSupabase,
  siFirebase,
  siFlutter,
  siNodedotjs,
  siBlender,
  siBambulab,
  type SimpleIcon,
} from "simple-icons";
import { getTechnologies } from "@/lib/content";

const icons: Record<string, SimpleIcon> = {
  react: siReact,
  javascript: siJavascript,
  rust: siRust,
  tauri: siTauri,
  ffmpeg: siFfmpeg,
  python: siPython,
  cplusplus: siCplusplus,
  tensorflow: siTensorflow,
  espressif: siEspressif,
  pytorch: siPytorch,
  opencv: siOpencv,
  arduino: siArduino,
  raspberrypi: siRaspberrypi,
  supabase: siSupabase,
  firebase: siFirebase,
  flutter: siFlutter,
  nodedotjs: siNodedotjs,
  blender: siBlender,
  bambulab: siBambulab,
};
function luminance(hex: string) {
  const rgb = hex
    .match(/\w\w/g)!
    .map((part) => parseInt(part, 16) / 255)
    .map((value) =>
      value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
    );
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
}
export function TechLogo({ id, withName = false }: { id: string; withName?: boolean }) {
  const tech = getTechnologies().find((item) => item.id === id);
  if (!tech) return <span className="tech-fallback">{id}</span>;
  const localId = tech.logo.startsWith("local:") ? tech.logo.slice(6) : id;
  const local = ["svg", "png", "webp"]
    .map((extension) => `/logos/${localId}.${extension}`)
    .find((src) => fs.existsSync(path.join(process.cwd(), "public", src)));
  const icon = icons[tech.logo.replace("simple:", "")];
  const color =
    icon === siBambulab
      ? "#008a46"
      : icon && (luminance("F4F6FB") + 0.05) / (luminance(icon.hex) + 0.05) >= 3
        ? `#${icon.hex}`
        : "#0B1240";
  const label =
    icon && icon.title !== tech.name ? `${tech.name} · ${icon.title}` : tech.name;
  return (
    <span className={`tech-logo ${withName ? "with-name" : ""}`} title={label}>
      {local ? (
        <Image
          src={local}
          width={28}
          height={28}
          style={{ width: 28, height: 28, objectFit: "contain" }}
          alt=""
        />
      ) : icon ? (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          role="img"
          aria-label={icon.title}
          fill={color}
        >
          <path d={icon.path} />
        </svg>
      ) : !withName ? (
        <span className="tech-fallback">{tech.name}</span>
      ) : null}
      {withName && <span>{tech.name}</span>}
      {!withName && (
        <span className="logo-tooltip" aria-hidden="true">
          {tech.name}
        </span>
      )}
    </span>
  );
}
