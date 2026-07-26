"use client";

import { useDraggable } from "@dnd-kit/core";
import { MessageSquare } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";
import { PRIORITY_LABELS, type Priority } from "@/lib/priority";
import type { Task } from "@/lib/tasks";
import styles from "./TaskCard.module.css";

const PRIORITY_CLASS: Record<Priority, string> = {
  low: styles.priorityLow,
  medium: styles.priorityMedium,
  high: styles.priorityHigh,
};

export function TaskCard({ task, onOpen }: { task: Task; onOpen: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: task.id });
  const CategoryIcon = CATEGORIES[task.category].icon;

  return (
    <button
      ref={setNodeRef}
      className={styles.card}
      style={{ opacity: isDragging ? 0.4 : 1 }}
      onClick={onOpen}
      {...listeners}
      {...attributes}
    >
      <div className={styles.topRow}>
        <span className={styles.category}>
          <CategoryIcon size={14} />
          {CATEGORIES[task.category].label}
        </span>
        <span className={`${styles.priority} ${PRIORITY_CLASS[task.priority]}`}>
          {PRIORITY_LABELS[task.priority]}
        </span>
      </div>

      <span className={styles.title}>{task.title}</span>

      {task.resolution_note && (
        <span className={styles.resolutionNote}>{task.resolution_note}</span>
      )}

      <div className={styles.bottomRow}>
        <span className={styles.assignee}>
          {task.assignee ? (
            <>
              <span
                className={styles.avatar}
                style={{ "--avatar-color": task.assignee.color } as React.CSSProperties}
              >
                {task.assignee.name.charAt(0)}
              </span>
              {task.assignee.name}
            </>
          ) : (
            <span className={styles.unassigned}>Nicht zugewiesen</span>
          )}
        </span>
        <span className={styles.commentCount}>
          <MessageSquare size={14} />
          {task.comments?.length ?? 0}
        </span>
      </div>
    </button>
  );
}
