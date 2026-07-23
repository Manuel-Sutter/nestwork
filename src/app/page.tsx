import { getCurrentUserId } from "@/lib/currentUser";
import { getSupabaseServerClient } from "@/lib/supabase";
import { getTasks } from "@/lib/tasks";
import { PushRegistration } from "@/components/push/PushRegistration";
import { Board } from "@/components/board/Board";
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
  const { data: users } = await supabase.from("users").select("id, name, color").order("name");
  const tasks = await getTasks(supabase);

  return (
    <main>
      <header className={styles.header}>
        <span>Hallo, {user?.name ?? "Unbekannt"}!</span>
        <PushRegistration />
      </header>
      <Board tasks={tasks} users={users ?? []} />
    </main>
  );
}
