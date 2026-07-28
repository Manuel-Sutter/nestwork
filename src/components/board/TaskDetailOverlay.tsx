"use client";

import { useState } from "react";
import { X, UserX } from "lucide-react";
import { CATEGORIES, CATEGORY_IDS, type CategoryId } from "@/lib/categories";
import { PRIORITIES, PRIORITY_LABELS, type Priority } from "@/lib/priority";
import { TASK_STATUSES, TASK_STATUS_LABELS, type TaskStatus } from "@/lib/taskStatus";
import type { Comment, Reaction, Task } from "@/lib/tasks";
import { Comments } from "./Comments";
import styles from "./TaskDetailOverlay.module.css";

type UserOption = { id: string; name: string; color: string };

export function TaskDetailOverlay({
  task,
  users,
  currentUserId,
  onClose,
  onPatch,
  onCommentAdded,
  onReactionToggled,
}: {
  task: Task;
  users: UserOption[];
  currentUserId: string | null;
  onClose: () => void;
  onPatch: (fields: Record<string, unknown>) => void;
  onCommentAdded: (comment: Comment) => void;
  onReactionToggled: (commentId: string, reactions: Reaction[]) => void;
}) {
  const [title, setTitle] = useState(task.title);

  function commitTitle() {
    const trimmed = title.trim();
    if (trimmed && trimmed !== task.title) {
      onPatch({ title: trimmed });
    } else {
      setTitle(task.title);
    }
  }

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <input
            className={styles.title}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            }}
          />
          <button className={styles.closeButton} onClick={onClose} aria-label="Schließen">
            <X size={16} />
          </button>
        </div>

        <div className={styles.chipRow}>
          {CATEGORY_IDS.map((id) => {
            const Icon = CATEGORIES[id].icon;
            return (
              <button
                key={id}
                className={`${styles.iconChip} ${task.category === id ? styles.iconChipSelected : ""}`}
                onClick={() => onPatch({ category: id as CategoryId })}
                title={CATEGORIES[id].label}
                aria-label={CATEGORIES[id].label}
              >
                <Icon size={15} />
              </button>
            );
          })}
        </div>

        <div className={styles.chipRow}>
          {PRIORITIES.map((p) => (
            <button
              key={p}
              className={`${styles.chip} ${task.priority === p ? styles.chipSelected : ""}`}
              onClick={() => onPatch({ priority: p as Priority })}
            >
              {PRIORITY_LABELS[p]}
            </button>
          ))}
        </div>

        <div className={styles.chipRow}>
          {TASK_STATUSES.map((s) => (
            <button
              key={s}
              className={`${styles.chip} ${task.status === s ? styles.chipSelected : ""}`}
              onClick={() => onPatch({ status: s as TaskStatus })}
            >
              {TASK_STATUS_LABELS[s]}
            </button>
          ))}
        </div>

        <div className={styles.chipRow}>
          <button
            className={`${styles.unassignedChip} ${!task.assignee_id ? styles.unassignedChipSelected : ""}`}
            onClick={() => onPatch({ assignee_id: null, assignee: null })}
            title="Nicht zugewiesen"
            aria-label="Nicht zugewiesen"
          >
            <UserX size={14} />
          </button>
          {users.map((u) => (
            <button
              key={u.id}
              className={`${styles.avatarChip} ${task.assignee_id === u.id ? styles.avatarChipSelected : ""}`}
              onClick={() =>
                onPatch({ assignee_id: u.id, assignee: { name: u.name, color: u.color } })
              }
              style={{ "--avatar-color": u.color } as React.CSSProperties}
              title={u.name}
              aria-label={u.name}
            >
              {u.name.charAt(0)}
            </button>
          ))}
        </div>

        <div className={styles.divider} />

        <Comments
          taskId={task.id}
          comments={task.comments ?? []}
          users={users}
          currentUserId={currentUserId}
          onCommentAdded={onCommentAdded}
          onPatch={onPatch}
          onReactionToggled={onReactionToggled}
        />
      </div>
    </div>
  );
}
