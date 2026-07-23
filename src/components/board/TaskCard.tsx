"use client";

import { MessageSquare } from "lucide-react";
import { CATEGORIES, CATEGORY_IDS, type CategoryId } from "@/lib/categories";
import { PRIORITIES, PRIORITY_LABELS, type Priority } from "@/lib/priority";
import { TASK_STATUSES, TASK_STATUS_LABELS, type TaskStatus } from "@/lib/taskStatus";
import type { Task } from "@/lib/tasks";
import styles from "./TaskCard.module.css";

const PRIORITY_CLASS: Record<Priority, string> = {
  low: styles.priorityLow,
  medium: styles.priorityMedium,
  high: styles.priorityHigh,
};

type UserOption = { id: string; name: string; color: string };

export function TaskCard({
  task,
  users,
  onChanged,
}: {
  task: Task;
  users: UserOption[];
  onChanged: () => void;
}) {
  async function patch(fields: Record<string, unknown>) {
    await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });
    onChanged();
  }

  const CategoryIcon = CATEGORIES[task.category].icon;

  return (
    <div className={styles.card}>
      <div className={styles.topRow}>
        <span className={styles.category}>
          <CategoryIcon size={14} />
          <select
            className={styles.statusSelect}
            value={task.category}
            onChange={(e) => patch({ category: e.target.value as CategoryId })}
          >
            {CATEGORY_IDS.map((id) => (
              <option key={id} value={id}>
                {CATEGORIES[id].label}
              </option>
            ))}
          </select>
        </span>
        <select
          className={`${styles.priority} ${PRIORITY_CLASS[task.priority]}`}
          value={task.priority}
          onChange={(e) => patch({ priority: e.target.value as Priority })}
        >
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {PRIORITY_LABELS[p]}
            </option>
          ))}
        </select>
      </div>

      <span className={styles.title}>{task.title}</span>

      {task.resolution_note && (
        <span className={styles.resolutionNote}>{task.resolution_note}</span>
      )}

      <div className={styles.bottomRow}>
        <span className={styles.assignee}>
          {task.assignee && (
            <span
              className={styles.avatar}
              style={{ "--avatar-color": task.assignee.color } as React.CSSProperties}
            >
              {task.assignee.name.charAt(0)}
            </span>
          )}
          <select
            className={styles.statusSelect}
            value={task.assignee_id ?? ""}
            onChange={(e) => patch({ assigneeId: e.target.value || null })}
          >
            <option value="">Nicht zugewiesen</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </span>

        <span className={styles.meta}>
          <span className={styles.commentCount}>
            <MessageSquare size={14} />0
          </span>
          <select
            className={styles.statusSelect}
            value={task.status}
            onChange={(e) => patch({ status: e.target.value as TaskStatus })}
          >
            {TASK_STATUSES.map((s) => (
              <option key={s} value={s}>
                {TASK_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </span>
      </div>
    </div>
  );
}
