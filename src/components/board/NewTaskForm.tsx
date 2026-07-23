"use client";

import { useState } from "react";
import { CATEGORIES, CATEGORY_IDS } from "@/lib/categories";
import { PRIORITIES, PRIORITY_LABELS, type Priority } from "@/lib/priority";
import styles from "./NewTaskForm.module.css";

type UserOption = { id: string; name: string; color: string };

export function NewTaskForm({
  users,
  onCreated,
}: {
  users: UserOption[];
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORY_IDS[CATEGORY_IDS.length - 1]);
  const [priority, setPriority] = useState<Priority>("medium");
  const [assigneeId, setAssigneeId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || submitting) return;
    setSubmitting(true);
    try {
      await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category,
          priority,
          assigneeId: assigneeId || null,
        }),
      });
      setTitle("");
      setAssigneeId("");
      onCreated();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        className={styles.titleInput}
        type="text"
        placeholder="Neue Aufgabe..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <select
        className={styles.select}
        value={category}
        onChange={(e) => setCategory(e.target.value as typeof category)}
      >
        {CATEGORY_IDS.map((id) => (
          <option key={id} value={id}>
            {CATEGORIES[id].label}
          </option>
        ))}
      </select>
      <select
        className={styles.select}
        value={priority}
        onChange={(e) => setPriority(e.target.value as Priority)}
      >
        {PRIORITIES.map((p) => (
          <option key={p} value={p}>
            {PRIORITY_LABELS[p]}
          </option>
        ))}
      </select>
      <select
        className={styles.select}
        value={assigneeId}
        onChange={(e) => setAssigneeId(e.target.value)}
      >
        <option value="">Nicht zugewiesen</option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name}
          </option>
        ))}
      </select>
      <button className={styles.submit} type="submit" disabled={submitting}>
        Hinzufügen
      </button>
    </form>
  );
}
