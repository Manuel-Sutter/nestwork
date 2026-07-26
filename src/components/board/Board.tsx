"use client";

import { useOptimistic, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { TASK_STATUSES, type TaskStatus } from "@/lib/taskStatus";
import type { Comment, Task } from "@/lib/tasks";
import { Composer } from "./Composer";
import { Column } from "./Column";
import { TaskCard } from "./TaskCard";
import { TaskDetailOverlay } from "./TaskDetailOverlay";
import styles from "./Board.module.css";

type UserOption = { id: string; name: string; color: string };

// closestCenter picks whichever droppable's center is nearest by distance,
// which can flag a column the pointer never actually entered (e.g. a wide
// "Done" column whose center is closer than "In Progress"'s, even though
// the cursor is only hovering over "In Progress"). pointerWithin only
// matches a column the pointer is literally inside, so a drag can't skip
// to one it never visually crossed; rectIntersection is just a fallback
// for the rare case the pointer sits in a gap between columns.
const collisionDetection: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args);
  return pointerCollisions.length > 0 ? pointerCollisions : rectIntersection(args);
};

export function Board({ tasks, users }: { tasks: Task[]; users: UserOption[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
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

  function handleCommentAdded(taskId: string, comment: Comment) {
    startTransition(() => {
      const task = optimisticTasks.find((t) => t.id === taskId);
      applyOptimistic({
        id: taskId,
        fields: { comments: [...(task?.comments ?? []), comment] },
      });
      router.refresh();
    });
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } })
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function scrollToColumn(status: TaskStatus) {
    const target = columnsRef.current?.querySelector(`[data-status="${status}"]`);
    target?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
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
          onCommentAdded={(comment) => handleCommentAdded(openTask.id, comment)}
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
