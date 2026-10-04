import Image from "next/image";
import styles from "./project-figure.module.css";
import { MediaGallery } from "./media-gallery";
import type { EvidenceItem } from "@/lib/evidence";

export function ProjectFigure({ src, alt, caption, width = 1200, height = 570, items }: {
  src: string; alt: string; caption: string; width?: number; height?: number;
  items: EvidenceItem[];
}) {
  return (
    <figure className={styles.figure}>
      <MediaGallery items={items} title="Project figures" initialSrc={src}
        triggerClassName={styles.trigger} triggerLabel={`Open figure: ${alt}`}>
        <Image src={src} alt={alt} width={width} height={height}
          sizes="(max-width: 767px) calc(100vw - 40px), 760px" />
        <span className={styles.enlarge}>View in gallery</span>
      </MediaGallery>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}
