"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

type ModerationStatus = "approved" | "hidden" | "deleted" | "pending";

export function AdminPostActions({
  postId,
  initialStatus,
  compact = false,
}: {
  postId: string;
  initialStatus: ModerationStatus;
  compact?: boolean;
}) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const router = useRouter();
  const [status, setStatus] = useState<ModerationStatus>(initialStatus);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function updateStatus(nextStatus: ModerationStatus, reason: string | null) {
    setSaving(true);
    setMessage(null);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        throw new Error("You need to be signed in as admin.");
      }

      const nextActive = nextStatus === "deleted" ? false : true;

      const { error } = await supabase
        .from("posts")
        .update({
          moderation_status: nextStatus,
          moderation_reason: reason,
          moderated_at: new Date().toISOString(),
          moderated_by: user.id,
          is_active: nextActive,
        })
        .eq("id", postId);

      if (error) {
        throw error;
      }

      setStatus(nextStatus);
      setMessage(
        nextStatus === "approved"
          ? "Post kept live."
          : nextStatus === "hidden"
            ? "Post hidden from the app."
            : nextStatus === "deleted"
              ? "Post soft-deleted."
              : "Post moved to pending."
      );
      router.refresh();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unable to update moderation status.";
      setMessage(errorMessage);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <div className={`flex ${compact ? "gap-1.5" : "flex-wrap gap-2"}`}>
        <button
          type="button"
          onClick={() => void updateStatus("approved", null)}
          disabled={saving || status === "approved"}
          className={compact
            ? "flex-1 rounded-full bg-emerald-500 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
            : "rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"}
        >
          {saving && status !== "approved" ? "Saving..." : compact ? "Green" : "Keep approved"}
        </button>
        {!compact ? (
          <button
            type="button"
            onClick={() => void updateStatus("hidden", "Hidden by admin review")}
            disabled={saving || status === "hidden"}
            className="rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 disabled:opacity-50"
          >
            Hide
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => void updateStatus("deleted", "Deleted by admin review")}
          disabled={saving || status === "deleted"}
          className={compact
            ? "flex-1 rounded-full bg-rose-500 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
            : "rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"}
        >
          {compact ? "Red" : "Delete"}
        </button>
      </div>

      {message ? <p className={compact ? "text-xs leading-5 text-slate-600" : "text-sm leading-6 text-slate-600"}>{message}</p> : null}
    </div>
  );
}
