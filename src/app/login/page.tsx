import styles from "./page.module.css";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className={styles.wrap}>
      <form method="POST" action="/api/login" className={styles.card}>
        <span className={styles.title}>Nestwork</span>
        <input type="hidden" name="next" value={params.next ?? "/"} />
        <input
          className={styles.input}
          type="password"
          name="password"
          placeholder="Passwort"
          autoFocus
          required
        />
        {params.error && <span className={styles.error}>Falsches Passwort.</span>}
        <button className={styles.button} type="submit">
          Anmelden
        </button>
      </form>
    </div>
  );
}
