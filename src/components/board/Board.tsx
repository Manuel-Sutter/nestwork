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
  type DragMoveEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { TASK_STATUSES, type TaskStatus } from "@/lib/taskStatus";
import type { Comment, Reaction, Task } from "@/lib/tasks";
import { Composer } from "./Composer";
import { Column } from "./Column";
import { TaskCard } from "./TaskCard";
import { TaskDetailOverlay } from "./TaskDetailOverlay";
import styles from "./Board.module.css";

type UserOption = { id: string; name: string; color: string };

const MOBILE_BREAKPOINT = "(max-width: 640px)";
const EDGE_ZONE_PX = 60;
const PAGE_COOLDOWN_MS = 700;

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

export function Board({
  tasks,
  users,
  currentUserId,
}: {
  tasks: Task[];
  users: UserOption[];
  currentUserId: string | null;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const columnsRef = useRef<HTMLDivElement | null>(null);
  const lastPageAtRef = useRef(0);

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

  function handleReactionToggled(taskId: string, commentId: string, reactions: Reaction[]) {
    startTransition(() => {
      const task = optimisticTasks.find((t) => t.id === taskId);
      if (!task) return;
      applyOptimistic({
        id: taskId,
        fields: {
          comments: task.comments.map((c) => (c.id === commentId ? { ...c, reactions } : c)),
        },
      });
      router.refresh();
    });
  }

  // 150ms was too short - an ordinary swipe's brief initial dwell easily
  // satisfied it, so swiping to the next column kept accidentally picking
  // the card up instead of just scrolling. 400ms is long enough that a
  // quick swipe never qualifies, while a deliberate press-and-hold still
  // does - matches how Trello etc. distinguish "swipe" from "drag."
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 400, tolerance: 6 } })
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function scrollToColumn(status: TaskStatus) {
    const target = columnsRef.current?.querySelector(`[data-status="${status}"]`);
    target?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  }

  // On mobile, only one column is visible at a time, so a card being
  // dragged toward the screen edge needs the view to page over to the
  // next column *during* the drag (and stay there) - otherwise there's
  // nowhere visible to release it onto. This mirrors Trello's mobile
  // drag-to-edge-pages behavior rather than relying on continuous
  // pixel-scrolling, which fights with the scroll-snap column paging.
  function currentColumnIndex(): number {
    const container = columnsRef.current;
    if (!container) return 0;
    const columns = Array.from(container.querySelectorAll<HTMLElement>("[data-status]"));
    const containerLeft = container.getBoundingClientRect().left;
    let closestIndex = 0;
    let closestDistance = Infinity;
    columns.forEach((col, i) => {
      const distance = Math.abs(col.getBoundingClientRect().left - containerLeft);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = i;
      }
    });
    return closestIndex;
  }

  function handleDragMove(event: DragMoveEvent) {
    if (!window.matchMedia(MOBILE_BREAKPOINT).matches) return;
    const rect = event.active.rect.current.translated;
    if (!rect) return;

    const now = Date.now();
    if (now - lastPageAtRef.current < PAGE_COOLDOWN_MS) return;

    const viewportWidth = window.innerWidth;
    const currentIndex = currentColumnIndex();

    if (rect.right > viewportWidth - EDGE_ZONE_PX && currentIndex < TASK_STATUSES.length - 1) {
      lastPageAtRef.current = now;
      scrollToColumn(TASK_STATUSES[currentIndex + 1]);
    } else if (rect.left < EDGE_ZONE_PX && currentIndex > 0) {
      lastPageAtRef.current = now;
      scrollToColumn(TASK_STATUSES[currentIndex - 1]);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const activeTaskId = String(active.id);
    const draggedTask = optimisticTasks.find((t) => t.id === activeTaskId);
    if (!draggedTask) return;

    const overIsColumn = TASK_STATUSES.includes(over.id as TaskStatus);
    const overTask = overIsColumn ? null : optimisticTasks.find((t) => t.id === over.id);
    const targetStatus: TaskStatus = overIsColumn
      ? (over.id as TaskStatus)
      : (overTask?.status ?? draggedTask.status);

    const targetColumnTasks = optimisticTasks
      .filter((t) => t.status === targetStatus && t.id !== activeTaskId)
      .sort((a, b) => a.position - b.position);

    let insertIndex = targetColumnTasks.length;
    if (overTask) {
      const overIndex = targetColumnTasks.findIndex((t) => t.id === overTask.id);
      if (overIndex !== -1) {
        const activeRect = active.rect.current.translated;
        const overRect = over.rect;
        const movingUp = activeRect && activeRect.top < overRect.top;
        insertIndex = movingUp ? overIndex : overIndex + 1;
      }
    } else if (overIsColumn && targetColumnTasks.length > 0) {
      // Dropped on the column background rather than a specific card (e.g.
      // dragged up past the first card, or down past the last) - use which
      // half of the column's own rect the pointer is in to decide whether
      // that means "insert at the top" or "append at the bottom", instead
      // of always appending (which reads backwards when dragging upward).
      const activeRect = active.rect.current.translated;
      const columnMidpoint = (over.rect.top + over.rect.bottom) / 2;
      insertIndex = activeRect && activeRect.top < columnMidpoint ? 0 : targetColumnTasks.length;
    }

    const before = targetColumnTasks[insertIndex - 1];
    const after = targetColumnTasks[insertIndex];
    let newPosition: number;
    if (before && after) {
      newPosition = (before.position + after.position) / 2;
    } else if (after) {
      newPosition = after.position - 1000;
    } else if (before) {
      newPosition = before.position + 1000;
    } else {
      newPosition = Date.now();
    }

    patchTask(activeTaskId, { status: targetStatus, position: newPosition });
    if (targetStatus !== draggedTask.status) {
      scrollToColumn(targetStatus);
    }
  }

  const openTask = optimisticTasks.find((t) => t.id === openTaskId) ?? null;
  const activeTask = optimisticTasks.find((t) => t.id === activeId) ?? null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
    >
      <div className={styles.wrap}>
        <div className={styles.columns} ref={columnsRef}>
          {TASK_STATUSES.map((status) => (
            <Column
              key={status}
              status={status}
              tasks={optimisticTasks
                .filter((t) => t.status === status)
                .sort((a, b) => a.position - b.position)}
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
          currentUserId={currentUserId}
          onClose={() => setOpenTaskId(null)}
          onPatch={(fields) => patchTask(openTask.id, fields)}
          onCommentAdded={(comment) => handleCommentAdded(openTask.id, comment)}
          onReactionToggled={(commentId, reactions) =>
            handleReactionToggled(openTask.id, commentId, reactions)
          }
        />
      )}
      <DragOverlay>
        {activeTask && (
          <div style={{ transform: "rotate(3deg) scale(1.03)" }}>
            <TaskCard task={activeTask} onOpen={() => {}} dragOverlay />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
