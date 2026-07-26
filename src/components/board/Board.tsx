"use client";

import { useOptimistic, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { TASK_STATUSES, type TaskStatus } from "@/lib/taskStatus";
import type { Task } from "@/lib/tasks";
import { Composer } from "./Composer";
import { Column } from "./Column";
import { TaskCard } from "./TaskCard";
import { TaskDetailOverlay } from "./TaskDetailOverlay";
import styles from "./Board.module.css";

type UserOption = { id: string; name: string; color: string };

const MOBILE_BREAKPOINT = "(max-width: 640px)";

export function Board({ tasks, users }: { tasks: Task[]; users: UserOption[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeStatus, setActiveStatus] = useState<TaskStatus | null>(null);
  const columnsRef = useRef<HTMLDivElement | null>(null);

  const [optimisticTasks, applyOptimistic] = useOptimistic(
    tasks,
    (state, patch: { id: string; fields: Partial<Task> }) =>
      state.map((t) => (t.id === patch.id ? { ...t, ...patch.fields } : t))
  );

  function patchTask(taskId: string, fields: Record<string, unknown>) {
    startTransition(async () => {
      applyOptimistic({ id: taskId, fields: fields as Partial<Task> });
      await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      router.refresh();
    });
  }

  function handleCreated(taskId: string) {
    setOpenTaskId(taskId);
    router.refresh();
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } })
  );

  // On mobile, only the current column and its immediate neighbors are
  // visible at once - a card that's off-screen (e.g. "Zu erledigen" while
  // "Erledigt" is in view) can still register a geometric collision, which
  // let a small drag skip straight past the adjacent column. Restricting
  // candidates to status neighbors makes "one column at a time" literal.
  const collisionDetection: CollisionDetection = (args) => {
    if (!activeStatus || window.matchMedia(MOBILE_BREAKPOINT).matches === false) {
      return closestCenter(args);
    }
    const currentIndex = TASK_STATUSES.indexOf(activeStatus);
    const allowed = new Set(
      [currentIndex - 1, currentIndex, currentIndex + 1]
        .filter((i) => i >= 0 && i < TASK_STATUSES.length)
        .map((i) => TASK_STATUSES[i])
    );
    const filtered = args.droppableContainers.filter((c) => allowed.has(c.id as TaskStatus));
    return closestCenter({ ...args, droppableContainers: filtered });
  };

  function handleDragStart(event: DragStartEvent) {
    const id = String(event.active.id);
    setActiveId(id);
    setActiveStatus(optimisticTasks.find((t) => t.id === id)?.status ?? null);
  }

  function scrollToColumn(status: TaskStatus) {
    const target = columnsRef.current?.querySelector(`[data-status="${status}"]`);
    target?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    setActiveStatus(null);
    const { active, over } = event;
    if (!over) return;
    const newStatus = over.id as TaskStatus;
    const task = optimisticTasks.find((t) => t.id === active.id);
    if (task && task.status !== newStatus) {
      patchTask(String(active.id), { status: newStatus });
      scrollToColumn(newStatus);
    }
  }

  const openTask = optimisticTasks.find((t) => t.id === openTaskId) ?? null;
  const activeTask = optimisticTasks.find((t) => t.id === activeId) ?? null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className={styles.wrap}>
        <div className={styles.columns} ref={columnsRef}>
          {TASK_STATUSES.map((status) => (
            <Column
              key={status}
              status={status}
              tasks={optimisticTasks.filter((t) => t.status === status)}
              onOpen={setOpenTaskId}
            />
          ))}
        </div>
      </div>
      <Composer onCreated={handleCreated} />
      {openTask && (
        <TaskDetailOverlay
          task={openTask}
          users={users}
          onClose={() => setOpenTaskId(null)}
          onPatch={(fields) => patchTask(openTask.id, fields)}
        />
      )}
      <DragOverlay>
        {activeTask && (
          <div style={{ transform: "rotate(3deg) scale(1.03)" }}>
            <TaskCard task={activeTask} onOpen={() => {}} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
