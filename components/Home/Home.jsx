// app/page.js (or pages/index.js for Pages Router)
import Image from "next/image";
import Link from "next/link";
import styles from "./Home.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.profileImage}>
          <Image
            src="/assets/me.jpg"
            alt="Ira Quint"
            width={150}
            height={150}
            className={styles.profileImg}
          />
        </div>
        <h1 className={styles.title}>Ira Quint</h1>
        <p className={styles.subtitle}>Software Developer</p>
      </header>

      <div className={styles.mainContent}>
        <div className={styles.about}>
          <p>
            Hello 👋 — I'm a product engineer based in Washington, D.C. I've
            worked across all parts of the stack, with a strong focus on the
            frontend — I love thinking about the user experience from start to
            finish. Previously I've worked at{" "}
            <Link
              href="https://spanishdictionary.com/"
              className={styles.companyLink}
              target="_blank"
              rel="noopener"
            >
              SpanishDictionary
            </Link>
            ,{" "}
            <Link
              href="https://www.golfplusvr.com/"
              className={styles.companyLink}
              target="_blank"
              rel="noopener"
            >
              GOLF+
            </Link>
            , and{" "}
            <Link
              href="https://heytaco.com/"
              className={styles.companyLink}
              target="_blank"
              rel="noopener"
            >
              HeyTaco
            </Link>
            .
          </p>
          <br />
          <p>
            In my free time, you can find me biking around DC, teaching yoga, or
            spending time at Meridian Hill park.
          </p>
        </div>

        <div className={styles.linksSection}>
          <div className={styles.socialLinks}>
            <Link
              href="/assets/ira_quint_resume_june_2025.pdf"
              className={styles.socialLink}
              target="_blank"
              rel="noopener"
            >
              Resume
            </Link>
            <Link
              href="https://github.com/iraquint"
              className={styles.socialLink}
              target="_blank"
              rel="noopener"
            >
              GitHub
            </Link>
            <Link
              href="https://www.linkedin.com/in/iraquint/"
              className={styles.socialLink}
              target="_blank"
              rel="noopener"
            >
              LinkedIn
            </Link>
            <Link
              href="https://twitter.com/ira_quint"
              className={styles.socialLink}
              target="_blank"
              rel="noopener"
            >
              X
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
