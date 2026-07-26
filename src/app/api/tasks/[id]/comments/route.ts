import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/currentUser";
import { getSupabaseServerClient } from "@/lib/supabase";
import { writeHistoryEntry } from "@/lib/history";
import { notifyOtherUser, getActorName } from "@/lib/notifications/notify";
import { commentAddedNotification } from "@/lib/notifications/copy";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const actorId = await getCurrentUserId();
  if (!actorId) {
    return NextResponse.json({ error: "not signed in" }, { status: 401 });
  }
  const { id: taskId } = await params;
  const body = await request.json();
  const commentBody = typeof body?.body === "string" ? body.body.trim() : "";
  if (!commentBody) {
    return NextResponse.json({ error: "body is required" }, { status: 400 });
  }
  const replyToId = typeof body?.reply_to_id === "string" ? body.reply_to_id : null;

  const supabase = getSupabaseServerClient();
  const { data: task } = await supabase.from("tasks").select("title").eq("id", taskId).single();
  if (!task) {
    return NextResponse.json({ error: "task not found" }, { status: 404 });
  }

  const { data: comment, error } = await supabase
    .from("comments")
    .insert({
      task_id: taskId,
      author_id: actorId,
      body: commentBody,
      reply_to_id: replyToId,
    })
    .select("*, author:author_id(name, color)")
    .single();

  if (error || !comment) {
    return NextResponse.json({ error: error?.message ?? "insert failed" }, { status: 500 });
  }

  await writeHistoryEntry(supabase, {
    taskId,
    actorId,
    action: "comment_added",
    field: "comment",
    newValue: commentBody,
  });

  const actorName = await getActorName(supabase, actorId);
  await notifyOtherUser(supabase, actorId, {
    ...commentAddedNotification(actorName, task.title, commentBody),
    taskId,
  });

  return NextResponse.json({ comment });
}
