"use client";

import { useState, type FormEvent } from "react";
import { Field, inputClass } from "@/components/FormFields";
import { formatDateTime, type ReportComment } from "@/lib/report-data";

const MAX_COMMENT_LENGTH = 3000;

export default function ReportComments({ reportId, comments, signedIn }: {
  reportId: string;
  comments: ReportComment[];
  signedIn: boolean;
}) {
  const [posted, setPosted] = useState<ReportComment[]>([]);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const items = [...comments, ...posted.filter((comment) => !comments.some(({ id }) => id === comment.id))];

  async function postComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending || !content.trim()) return;

    setSending(true);
    setError("");
    try {
      const response = await fetch(`/api/v1/reports/${reportId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(response.status === 401
          ? "Sign in again to post your comment."
          : result.error ?? "Could not post the comment. Please try again.");
        return;
      }
      setPosted((current) => [...current, result]);
      setContent("");
    } catch {
      setError("Could not post the comment. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <section aria-labelledby="comments-heading" className="mt-6 rounded-3xl bg-card p-4 shadow-md">
      <h3 id="comments-heading" className="text-lg font-bold">Comments</h3>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-muted">No comments yet.</p>
      ) : (
        <ul className="mt-2 divide-y divide-border-soft" aria-live="polite">
          {items.map((comment) => (
            <li key={comment.id} className="py-3">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <span className="break-words font-semibold">{comment.user.name}</span>
                <time dateTime={comment.createdAt} className="text-xs text-muted">
                  {formatDateTime(comment.createdAt)}
                </time>
              </div>
              <p className="mt-1 whitespace-pre-wrap break-words">{comment.content}</p>
            </li>
          ))}
        </ul>
      )}
      {signedIn ? (
        <form onSubmit={postComment} className="mt-4 flex flex-col gap-2">
          <Field id="report-comment" label="Write a comment">
            <textarea
              id="report-comment"
              className={inputClass}
              rows={3}
              value={content}
              onChange={(event) => setContent(event.target.value)}
              maxLength={MAX_COMMENT_LENGTH}
              readOnly={sending}
              required
            />
          </Field>
          {error && <p role="alert" className="text-sm text-status-lost">{error}</p>}
          <button
            type="submit"
            disabled={sending || !content.trim()}
            className="min-h-11 self-start rounded-full bg-primary px-5 font-semibold text-primary-foreground disabled:opacity-60"
          >
            {sending ? "Posting…" : "Post comment"}
          </button>
        </form>
      ) : (
        <a href="/api/v1/auth/sso/login" className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-link">
          Sign in to comment
        </a>
      )}
    </section>
  );
}
