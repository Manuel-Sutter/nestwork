import styles from "@/components/board/SplashScreen.module.css";

export default function Loading() {
  return (
    <div className={styles.splash} style={{ animation: "none" }} aria-hidden="true">
      <div className={styles.orb} />
      <span className={styles.wordmark}>Nestwork</span>
    </div>
  );
}
