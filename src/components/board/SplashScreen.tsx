import styles from "./SplashScreen.module.css";

export function SplashScreen() {
  return (
    <div className={styles.splash} aria-hidden="true">
      <div className={styles.orb} />
      <span className={styles.wordmark}>Nestwork</span>
    </div>
  );
}
