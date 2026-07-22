import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/currentUser";
import { getSupabaseServerClient } from "@/lib/supabase";
import { sendPushToUsers } from "@/lib/notifications/sendPush";

// Throwaway route for the push-notification proof-of-concept (Milestone 2).
// Sends to every seeded user, not just the caller, so both phones can be
// verified from a single tap. Remove once real event-triggered pushes exist.
export async function POST() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "not signed in" }, { status: 401 });
  }

  const supabase = getSupabaseServerClient();
  const { data: users } = await supabase.from("users").select("id");
  const userIds = (users ?? []).map((u) => u.id);

  await sendPushToUsers(userIds, {
    title: "Nestwork",
    body: "Test-Benachrichtigung – Push funktioniert!",
  });

  return NextResponse.json({ ok: true, sentTo: userIds.length });
}
