"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { TASK_STATUS_LABELS, type TaskStatus } from "@/lib/taskStatus";
import type { Task } from "@/lib/tasks";
import { TaskCard } from "./TaskCard";
import styles from "./Column.module.css";

export function Column({
  status,
  tasks,
  onOpen,
}: {
  status: TaskStatus;
  tasks: Task[];
  onOpen: (taskId: string) => void;
}) {
  // The column itself is also a droppable - lets a card be dropped directly
  // on an empty column (or the header/gaps) rather than only ever on top
  // of another card.
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      data-status={status}
      className={`${styles.column} ${isOver ? styles.columnOver : ""}`}
    >
      <div className={styles.header}>
        <span className={styles.title}>{TASK_STATUS_LABELS[status]}</span>
        <span className={styles.count}>{tasks.length}</span>
      </div>
      <div className={styles.cards}>
        {tasks.length === 0 && <p className={styles.empty}>Keine Aufgaben</p>}
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onOpen={() => onOpen(task.id)} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
