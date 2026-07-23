import { getSupabaseServerClient } from "@/lib/supabase";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function WhoAmIPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const supabase = getSupabaseServerClient();
  const { data: users } = await supabase.from("users").select("id, name, color").order("name");

  return (
    <div className={styles.wrap}>
      <span className={styles.title}>Wer bist du?</span>
      <form method="POST" action="/api/whoami" className={styles.grid}>
        <input type="hidden" name="next" value={params.next ?? "/"} />
        {(users ?? []).map((user) => (
          <button
            key={user.id}
            type="submit"
            name="userId"
            value={user.id}
            className={styles.card}
            style={{ "--accent": user.color } as React.CSSProperties}
          >
            <span className={styles.avatar}>{user.name.charAt(0)}</span>
            {user.name}
          </button>
        ))}
      </form>
    </div>
  );
}
