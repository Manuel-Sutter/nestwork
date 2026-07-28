import { getCurrentUserId } from "@/lib/currentUser";
import { getSupabaseServerClient } from "@/lib/supabase";
import { getTasks } from "@/lib/tasks";
import { Hero } from "@/components/board/Hero";
import { Board } from "@/components/board/Board";

// The board reflects live shared state - it must never be frozen as a
// static snapshot from build time.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const userId = await getCurrentUserId();
  const supabase = getSupabaseServerClient();

  const [{ data: user }, { data: users }, tasks] = await Promise.all([
    userId
      ? supabase.from("users").select("name").eq("id", userId).single()
      : Promise.resolve({ data: null }),
    supabase.from("users").select("id, name, color").order("name"),
    getTasks(supabase),
  ]);

  return (
    <main>
      <Hero name={user?.name ?? "Unbekannt"} />
      <Board tasks={tasks} users={users ?? []} currentUserId={userId} />
    </main>
  );
}
