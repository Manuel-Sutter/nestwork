import { getCurrentUserId } from "@/lib/currentUser";
import { getSupabaseServerClient } from "@/lib/supabase";

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
    <main style={{ padding: "2rem" }}>
      <h1>Hallo, {user?.name ?? "Unbekannt"}!</h1>
      <p>Das Nestwork-Board kommt als Nächstes.</p>
    </main>
  );
}
