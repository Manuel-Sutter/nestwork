"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import type { Comment, Reaction } from "@/lib/tasks";
import styles from "./Comments.module.css";

type UserOption = { id: string; name: string; color: string };

const QUICK_EMOJIS = ["👍", "❤️", "😂", "🙏", "🎉"];

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function Comments({
  taskId,
  comments,
  users,
  currentUserId,
  onCommentAdded,
  onPatch,
  onReactionToggled,
}: {
  taskId: string;
  comments: Comment[];
  users: UserOption[];
  currentUserId: string | null;
  onCommentAdded: (comment: Comment) => void;
  onPatch: (fields: Record<string, unknown>) => void;
  onReactionToggled: (commentId: string, reactions: Reaction[]) => void;
}) {
  const [newBody, setNewBody] = useState("");
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [replyTargetId, setReplyTargetId] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const topLevel = comments
    .filter((c) => !c.reply_to_id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  function repliesFor(id: string) {
    return comments
      .filter((c) => c.reply_to_id === id)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  async function postComment(body: string, replyToId: string | null) {
    const trimmed = body.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: trimmed, reply_to_id: replyToId }),
      });
      const data = await res.json();
      if (data?.comment) onCommentAdded(data.comment);
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleReaction(comment: Comment, emoji: string) {
    if (!currentUserId) return;
    const current = comment.reactions ?? [];
    const alreadyReacted = current.some(
      (r) => r.user_id === currentUserId && r.emoji === emoji
    );
    // Apply the toggle instantly - we already know exactly what it should
    // look like, no need to wait on the round-trip before the pill reacts.
    const optimistic = alreadyReacted
      ? current.filter((r) => !(r.user_id === currentUserId && r.emoji === emoji))
      : [
          ...current,
          { id: `optimistic-${emoji}`, comment_id: comment.id, user_id: currentUserId, emoji },
        ];
    onReactionToggled(comment.id, optimistic);

    const res = await fetch(`/api/comments/${comment.id}/reactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emoji }),
    });
    const data = await res.json();
    if (data?.reactions) onReactionToggled(comment.id, data.reactions);
  }

  function handleNewBodyChange(value: string) {
    setNewBody(value);
    const match = value.match(/@(\w*)$/);
    setMentionQuery(match ? match[1] : null);
  }

  function selectMention(user: UserOption) {
    setNewBody((prev) => prev.replace(/@(\w*)$/, `@${user.name} `));
    setMentionQuery(null);
    onPatch({ assignee_id: user.id, assignee: { name: user.name, color: user.color } });
  }

  const matchingUsers = users.filter((u) =>
    u.name.toLowerCase().startsWith((mentionQuery ?? "").toLowerCase())
  );

  function renderComment(comment: Comment, isReply: boolean) {
    return (
      <div key={comment.id} className={isReply ? styles.reply : styles.comment}>
        <div className={styles.header}>
          <span
            className={styles.avatar}
            style={{ "--avatar-color": comment.author?.color } as React.CSSProperties}
          >
            {comment.author?.name.charAt(0) ?? "?"}
          </span>
          <span className={styles.author}>{comment.author?.name ?? "Unbekannt"}</span>
          <span className={styles.time}>{formatTime(comment.created_at)}</span>
        </div>
        <span className={styles.body}>{comment.body}</span>
        {!isReply && (
          <div className={styles.actions}>
            <button
              className={styles.replyButton}
              onClick={() =>
                setReplyTargetId(replyTargetId === comment.id ? null : comment.id)
              }
            >
              Antworten
            </button>
            {QUICK_EMOJIS.map((emoji) => {
              const reactors = (comment.reactions ?? []).filter((r) => r.emoji === emoji);
              const isActive = reactors.some((r) => r.user_id === currentUserId);
              return (
                <button
                  key={emoji}
                  className={`${styles.emojiButton} ${isActive ? styles.emojiButtonActive : ""}`}
                  onClick={() => toggleReaction(comment, emoji)}
                  aria-label={`Mit ${emoji} reagieren`}
                  aria-pressed={isActive}
                >
                  {emoji}
                  {reactors.length > 0 && (
                    <span className={styles.reactionCount}>{reactors.length}</span>
                  )}
                </button>
              );
            })}
          </div>
        )}
        {!isReply && replyTargetId === comment.id && (
          <div className={styles.replyInput}>
            <input
              className={styles.input}
              type="text"
              placeholder="Antwort..."
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  postComment(replyBody, comment.id);
                  setReplyBody("");
                  setReplyTargetId(null);
                }
              }}
            />
            <button
              className={styles.sendButton}
              disabled={!replyBody.trim()}
              onClick={() => {
                postComment(replyBody, comment.id);
                setReplyBody("");
                setReplyTargetId(null);
              }}
              aria-label="Antwort senden"
            >
              <Send size={16} />
            </button>
          </div>
        )}
        {!isReply &&
          repliesFor(comment.id).map((reply) => renderComment(reply, true))}
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.thread}>
        {topLevel.length === 0 && <span className={styles.empty}>Noch keine Kommentare</span>}
        {topLevel.map((comment) => renderComment(comment, false))}
      </div>

      <div className={styles.composer}>
        {mentionQuery !== null && matchingUsers.length > 0 && (
          <div className={styles.mentionPopover}>
            {matchingUsers.map((u) => (
              <button
                key={u.id}
                className={styles.mentionItem}
                onClick={() => selectMention(u)}
              >
                <span
                  className={styles.avatar}
                  style={{ "--avatar-color": u.color } as React.CSSProperties}
                >
                  {u.name.charAt(0)}
                </span>
                {u.name}
              </button>
            ))}
          </div>
        )}
        <input
          className={`${styles.input} ${styles.composerInput}`}
          type="text"
          placeholder="Kommentieren... (@ zum Zuweisen)"
          value={newBody}
          onChange={(e) => handleNewBodyChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && mentionQuery === null) {
              postComment(newBody, null);
              setNewBody("");
            }
          }}
        />
        <button
          className={styles.sendButton}
          disabled={!newBody.trim()}
          onClick={() => {
            postComment(newBody, null);
            setNewBody("");
          }}
          aria-label="Kommentar senden"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
