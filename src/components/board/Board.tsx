"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TASK_STATUSES } from "@/lib/taskStatus";
import type { Task } from "@/lib/tasks";
import { Composer } from "./Composer";
import { Column } from "./Column";
import { TaskDetailOverlay } from "./TaskDetailOverlay";
import styles from "./Board.module.css";

type UserOption = { id: string; name: string; color: string };

export function Board({ tasks, users }: { tasks: Task[]; users: UserOption[] }) {
  const router = useRouter();
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const onChanged = () => router.refresh();

  function handleCreated(taskId: string) {
    setOpenTaskId(taskId);
    router.refresh();
  }

  const openTask = tasks.find((t) => t.id === openTaskId) ?? null;

  return (
    <div className={styles.wrap}>
      <div className={styles.columns}>
        {TASK_STATUSES.map((status) => (
          <Column
            key={status}
            status={status}
            tasks={tasks.filter((t) => t.status === status)}
            onOpen={setOpenTaskId}
          />
        ))}
      </div>
      <Composer onCreated={handleCreated} />
      {openTask && (
        <TaskDetailOverlay
          task={openTask}
          users={users}
          onClose={() => setOpenTaskId(null)}
          onChanged={onChanged}
        />
      )}
    </div>
  );
}
