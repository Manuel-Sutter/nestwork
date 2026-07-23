"use client";

import { X } from "lucide-react";
import { CATEGORIES, CATEGORY_IDS, type CategoryId } from "@/lib/categories";
import { PRIORITIES, PRIORITY_LABELS, type Priority } from "@/lib/priority";
import { TASK_STATUSES, TASK_STATUS_LABELS, type TaskStatus } from "@/lib/taskStatus";
import type { Task } from "@/lib/tasks";
import styles from "./TaskDetailOverlay.module.css";

type UserOption = { id: string; name: string; color: string };

export function TaskDetailOverlay({
  task,
  users,
  onClose,
  onChanged,
}: {
  task: Task;
  users: UserOption[];
  onClose: () => void;
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

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <span className={styles.title}>{task.title}</span>
          <button className={styles.closeButton} onClick={onClose} aria-label="Schließen">
            <X size={16} />
          </button>
        </div>

        <div className={styles.section}>
          <span className={styles.sectionLabel}>Kategorie</span>
          <div className={styles.chips}>
            {CATEGORY_IDS.map((id) => {
              const Icon = CATEGORIES[id].icon;
              return (
                <button
                  key={id}
                  className={`${styles.chip} ${task.category === id ? styles.chipSelected : ""}`}
                  onClick={() => patch({ category: id as CategoryId })}
                >
                  <Icon size={14} />
                  {CATEGORIES[id].label}
                </button>
              );
            })}
          </div>
        </div>

        <div className={styles.section}>
          <span className={styles.sectionLabel}>Priorität</span>
          <div className={styles.chips}>
            {PRIORITIES.map((p) => (
              <button
                key={p}
                className={`${styles.chip} ${task.priority === p ? styles.chipSelected : ""}`}
                onClick={() => patch({ priority: p as Priority })}
              >
                {PRIORITY_LABELS[p]}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <span className={styles.sectionLabel}>Zugewiesen</span>
          <div className={styles.chips}>
            <button
              className={`${styles.chip} ${!task.assignee_id ? styles.chipSelected : ""}`}
              onClick={() => patch({ assigneeId: null })}
            >
              Nicht zugewiesen
            </button>
            {users.map((u) => (
              <button
                key={u.id}
                className={`${styles.chip} ${task.assignee_id === u.id ? styles.chipSelected : ""}`}
                onClick={() => patch({ assigneeId: u.id })}
              >
                <span
                  className={styles.avatarChip}
                  style={{ "--avatar-color": u.color } as React.CSSProperties}
                >
                  {u.name.charAt(0)}
                </span>
                {u.name}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <span className={styles.sectionLabel}>Status</span>
          <div className={styles.chips}>
            {TASK_STATUSES.map((s) => (
              <button
                key={s}
                className={`${styles.chip} ${task.status === s ? styles.chipSelected : ""}`}
                onClick={() => patch({ status: s as TaskStatus })}
              >
                {TASK_STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
