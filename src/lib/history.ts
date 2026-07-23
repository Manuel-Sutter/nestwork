import { SupabaseClient } from "@supabase/supabase-js";

type HistoryAction =
  | "created"
  | "status_changed"
  | "assigned"
  | "edited"
  | "comment_added"
  | "reminder_set"
  | "reminder_snoozed";

export async function writeHistoryEntry(
  supabase: SupabaseClient,
  entry: {
    taskId: string;
    actorId: string;
    action: HistoryAction;
    field?: string;
    oldValue?: unknown;
    newValue?: unknown;
  }
) {
  await supabase.from("task_history").insert({
    task_id: entry.taskId,
    actor_id: entry.actorId,
    action: entry.action,
    field: entry.field ?? null,
    old_value: entry.oldValue ?? null,
    new_value: entry.newValue ?? null,
  });
}
