export type TaskStatus = "todo" | "in_progress" | "done";

export const TASK_STATUSES: TaskStatus[] = ["todo", "in_progress", "done"];

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};
