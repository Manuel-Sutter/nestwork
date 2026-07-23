"use client";

import { useState } from "react";
import { Mic, ArrowUp } from "lucide-react";
import styles from "./Composer.module.css";

export function Composer({ onCreated }: { onCreated: (taskId: string) => void }) {
  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showMicHint, setShowMicHint] = useState(false);

  function handleMicClick() {
    setShowMicHint(true);
    setTimeout(() => setShowMicHint(false), 2000);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const submittedTitle = title.trim();
    if (!submittedTitle || submitting) return;
    setSubmitting(true);
    setTitle("");
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: submittedTitle }),
      });
      const data = await res.json();
      if (data?.task?.id) onCreated(data.task.id);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.wrap}>
      <form className={styles.bar} onSubmit={handleSubmit}>
        {showMicHint && <span className={styles.hint}>Sprachaufnahme kommt bald</span>}
        <input
          className={styles.input}
          type="text"
          placeholder="Neue Aufgabe..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button
          type="button"
          className={styles.iconButton}
          onClick={handleMicClick}
          aria-label="Sprachaufnahme"
        >
          <Mic size={18} />
        </button>
        <button
          type="submit"
          className={styles.submitButton}
          disabled={!title.trim() || submitting}
          aria-label="Aufgabe hinzufügen"
        >
          <ArrowUp size={18} />
        </button>
      </form>
    </div>
  );
}
