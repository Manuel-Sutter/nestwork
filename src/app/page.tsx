import { getCurrentUserId } from "@/lib/currentUser";
import { getSupabaseServerClient } from "@/lib/supabase";
import { PushRegistration } from "@/components/push/PushRegistration";
import styles from "./page.module.css";

// The board reflects live shared state - it must never be frozen as a
// static snapshot from build time.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const userId = await getCurrentUserId();
  const supabase = getSupabaseServerClient();
  const { data: user } = userId
    ? await supabase.from("users").select("name").eq("id", userId).single()
    : { data: null };

  return (
    <main className={styles.wrap}>
      <div className={styles.card}>
        <h1 className={styles.title}>Hallo, {user?.name ?? "Unbekannt"}!</h1>
        <p className={styles.subtitle}>Das Nestwork-Board kommt als Nächstes.</p>
        <PushRegistration />
      </div>
    </main>
  );
}
