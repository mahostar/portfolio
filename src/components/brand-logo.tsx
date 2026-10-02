import Image from "next/image";
import styles from "./brand-logo.module.css";

export function BrandLogo() {
  return (
    <span className={styles.logo} aria-hidden="true">
      <Image src="/logos/Website-Logo.png" alt="" width={64} height={64} className={styles.image} />
    </span>
  );
}
