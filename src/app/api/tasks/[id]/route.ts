import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/currentUser";
import { getSupabaseServerClient } from "@/lib/supabase";
import { writeHistoryEntry } from "@/lib/history";
import { isCategoryId } from "@/lib/categories";
import { PRIORITIES } from "@/lib/priority";
import { TASK_STATUSES } from "@/lib/taskStatus";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const actorId = await getCurrentUserId();
  if (!actorId) {
    return NextResponse.json({ error: "not signed in" }, { status: 401 });
  }
  const { id } = await params;
  const body = await request.json();

  const supabase = getSupabaseServerClient();
  const { data: existing, error: fetchError } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ error: "task not found" }, { status: 404 });
  }

  const updates: Record<string, unknown> = {};

  if (typeof body?.status === "string" && TASK_STATUSES.includes(body.status)) {
    updates.status = body.status;
  }
  if (typeof body?.category === "string" && isCategoryId(body.category)) {
    updates.category = body.category;
  }
  if (typeof body?.priority === "string" && PRIORITIES.includes(body.priority)) {
    updates.priority = body.priority;
  }
  if ("assigneeId" in (body ?? {})) {
    updates.assignee_id = body.assigneeId;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "no valid fields to update" }, { status: 400 });
  }

  updates.updated_at = new Date().toISOString();

  const { data: updated, error: updateError } = await supabase
    .from("tasks")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (updateError || !updated) {
    return NextResponse.json({ error: updateError?.message ?? "update failed" }, { status: 500 });
  }

  if (updates.status && updates.status !== existing.status) {
    await writeHistoryEntry(supabase, {
      taskId: id,
      actorId,
      action: "status_changed",
      field: "status",
      oldValue: existing.status,
      newValue: updates.status,
    });
  }
  if ("assignee_id" in updates && updates.assignee_id !== existing.assignee_id) {
    await writeHistoryEntry(supabase, {
      taskId: id,
      actorId,
      action: "assigned",
      field: "assignee_id",
      oldValue: existing.assignee_id,
      newValue: updates.assignee_id,
    });
  }
  if (updates.category && updates.category !== existing.category) {
    await writeHistoryEntry(supabase, {
      taskId: id,
      actorId,
      action: "edited",
      field: "category",
      oldValue: existing.category,
      newValue: updates.category,
    });
  }
  if (updates.priority && updates.priority !== existing.priority) {
    await writeHistoryEntry(supabase, {
      taskId: id,
      actorId,
      action: "edited",
      field: "priority",
      oldValue: existing.priority,
      newValue: updates.priority,
    });
  }

  return NextResponse.json({ task: updated });
}
