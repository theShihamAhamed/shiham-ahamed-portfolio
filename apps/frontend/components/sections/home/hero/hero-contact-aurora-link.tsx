import Link from "next/link";

import styles from "./hero-contact-aurora-link.module.css";

export function HeroContactAuroraLink() {
  return (
    <span className={styles.root}>
      <Link className={styles.link} href="/contact">
        <span className={styles.label}>Contact Me</span>
      </Link>

      <span aria-hidden="true" className={styles.glow}>
        <span className={styles.mask}>
          <span className={styles.field}>
            <span className={styles.strip} />
          </span>
        </span>
      </span>
    </span>
  );
}
