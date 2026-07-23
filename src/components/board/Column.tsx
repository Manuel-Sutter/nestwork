"use client";

import { TASK_STATUS_LABELS, type TaskStatus } from "@/lib/taskStatus";
import type { Task } from "@/lib/tasks";
import { TaskCard } from "./TaskCard";
import styles from "./Column.module.css";

type UserOption = { id: string; name: string; color: string };

export function Column({
  status,
  tasks,
  users,
  onChanged,
}: {
  status: TaskStatus;
  tasks: Task[];
  users: UserOption[];
  onChanged: () => void;
}) {
  return (
    <div className={styles.column}>
      <div className={styles.header}>
        <span className={styles.title}>{TASK_STATUS_LABELS[status]}</span>
        <span className={styles.count}>{tasks.length}</span>
      </div>
      <div className={styles.cards}>
        {tasks.length === 0 && <p className={styles.empty}>Keine Aufgaben</p>}
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} users={users} onChanged={onChanged} />
        ))}
      </div>
    </div>
  );
}
