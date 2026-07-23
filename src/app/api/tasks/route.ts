import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/currentUser";
import { getSupabaseServerClient } from "@/lib/supabase";
import { writeHistoryEntry } from "@/lib/history";
import { isCategoryId } from "@/lib/categories";
import { PRIORITIES, type Priority } from "@/lib/priority";

export async function POST(request: NextRequest) {
  const actorId = await getCurrentUserId();
  if (!actorId) {
    return NextResponse.json({ error: "not signed in" }, { status: 401 });
  }

  const body = await request.json();
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const category = isCategoryId(body?.category) ? body.category : "sonstiges";
  const priority: Priority = PRIORITIES.includes(body?.priority) ? body.priority : "medium";
  const assigneeId = typeof body?.assigneeId === "string" ? body.assigneeId : null;

  const supabase = getSupabaseServerClient();
  const { data: task, error } = await supabase
    .from("tasks")
    .insert({
      title,
      category,
      priority,
      assignee_id: assigneeId,
      created_by: actorId,
    })
    .select()
    .single();

  if (error || !task) {
    return NextResponse.json({ error: error?.message ?? "insert failed" }, { status: 500 });
  }

  await writeHistoryEntry(supabase, {
    taskId: task.id,
    actorId,
    action: "created",
  });

  return NextResponse.json({ task });
}
