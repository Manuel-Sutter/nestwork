import { SupabaseClient } from "@supabase/supabase-js";
import type { CategoryId } from "@/lib/categories";
import type { Priority } from "@/lib/priority";
import type { TaskStatus } from "@/lib/taskStatus";

export type Comment = {
  id: string;
  task_id: string;
  author_id: string;
  body: string;
  reply_to_id: string | null;
  created_at: string;
  author: { name: string; color: string } | null;
};

export type Task = {
  id: string;
  title: string;
  description: string | null;
  category: CategoryId;
  status: TaskStatus;
  priority: Priority;
  assignee_id: string | null;
  created_by: string;
  resolution_note: string | null;
  due_at: string | null;
  created_at: string;
  updated_at: string;
  assignee: { name: string; color: string } | null;
  comments: Comment[];
};

export async function getTasks(supabase: SupabaseClient): Promise<Task[]> {
  const { data } = await supabase
    .from("tasks")
    .select("*, assignee:assignee_id(name, color), comments(*, author:author_id(name, color))")
    .order("created_at", { ascending: false });
  return (data ?? []) as unknown as Task[];
}
