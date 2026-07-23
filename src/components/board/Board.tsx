"use client";

import { useRouter } from "next/navigation";
import { TASK_STATUSES } from "@/lib/taskStatus";
import type { Task } from "@/lib/tasks";
import { NewTaskForm } from "./NewTaskForm";
import { Column } from "./Column";
import styles from "./Board.module.css";

type UserOption = { id: string; name: string; color: string };

export function Board({ tasks, users }: { tasks: Task[]; users: UserOption[] }) {
  const router = useRouter();
  const onChanged = () => router.refresh();

  return (
    <div className={styles.wrap}>
      <NewTaskForm users={users} onCreated={onChanged} />
      <div className={styles.columns}>
        {TASK_STATUSES.map((status) => (
          <Column
            key={status}
            status={status}
            tasks={tasks.filter((t) => t.status === status)}
            users={users}
            onChanged={onChanged}
          />
        ))}
      </div>
    </div>
  );
}
