import { SupabaseClient } from "@supabase/supabase-js";
import { getNotificationTargets } from "./getNotificationTargets";
import { sendPushToUsers } from "./sendPush";

export async function notifyOtherUser(
  supabase: SupabaseClient,
  actorId: string,
  payload: { title: string; body: string; taskId?: string }
) {
  const { data: users } = await supabase.from("users").select("id");
  const allIds = (users ?? []).map((u) => u.id);
  const targets = getNotificationTargets(actorId, allIds);
  await sendPushToUsers(targets, payload);
}

export async function getActorName(supabase: SupabaseClient, actorId: string) {
  const { data } = await supabase.from("users").select("name").eq("id", actorId).single();
  return data?.name ?? "Jemand";
}
