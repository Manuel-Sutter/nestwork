import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/currentUser";
import { getSupabaseServerClient } from "@/lib/supabase";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const actorId = await getCurrentUserId();
  if (!actorId) {
    return NextResponse.json({ error: "not signed in" }, { status: 401 });
  }
  const { id: commentId } = await params;
  const body = await request.json();
  const emoji = typeof body?.emoji === "string" ? body.emoji : "";
  if (!emoji) {
    return NextResponse.json({ error: "emoji is required" }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  const { data: existing } = await supabase
    .from("comment_reactions")
    .select("id")
    .eq("comment_id", commentId)
    .eq("user_id", actorId)
    .eq("emoji", emoji)
    .maybeSingle();

  if (existing) {
    await supabase.from("comment_reactions").delete().eq("id", existing.id);
  } else {
    await supabase
      .from("comment_reactions")
      .insert({ comment_id: commentId, user_id: actorId, emoji });
  }

  const { data: reactions } = await supabase
    .from("comment_reactions")
    .select("*")
    .eq("comment_id", commentId);

  return NextResponse.json({ reactions: reactions ?? [] });
}
