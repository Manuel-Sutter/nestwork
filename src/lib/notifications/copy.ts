import { TASK_STATUS_LABELS, type TaskStatus } from "@/lib/taskStatus";

export function taskCreatedNotification(actorName: string, title: string) {
  return { title: "Nestwork", body: `${actorName} hat "${title}" hinzugefügt` };
}

export function taskAssignedNotification(actorName: string, title: string) {
  return { title: "Nestwork", body: `${actorName} hat dir "${title}" zugewiesen` };
}

export function taskStatusChangedNotification(title: string, status: TaskStatus) {
  return { title: "Nestwork", body: `"${title}" ist jetzt ${TASK_STATUS_LABELS[status]}` };
}

export function commentAddedNotification(actorName: string, title: string, body: string) {
  return {
    title: "Nestwork",
    body: `${actorName} hat zu "${title}" kommentiert: ${body}`,
  };
}
