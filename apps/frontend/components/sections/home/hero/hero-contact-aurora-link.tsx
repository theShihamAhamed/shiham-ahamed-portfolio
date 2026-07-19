import Link from "next/link";

import styles from "./hero-contact-aurora-link.module.css";

function AuroraLayers() {
  return (
    <span aria-hidden="true" className={styles.auroraGlow}>
      <span className={styles.auroraMask}>
        <span className={styles.auroraVisible}>
          <span className={styles.auroraField}>
            <span className={styles.auroraStrip} />
          </span>
        </span>
      </span>
    </span>
  );
}

export function HeroContactAuroraLink() {
  return (
    <span className={styles.auroraRoot}>
      <Link className={styles.auroraButton} href="/contact">
        <span className={styles.auroraText}>Contact Me</span>
      </Link>
      <AuroraLayers />
    </span>
  );
}
