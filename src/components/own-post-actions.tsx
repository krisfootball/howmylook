"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export function OwnPostActions({
  postId,
  initialCaption,
  backHref,
  ownerId,
}: {
  postId: string;
  initialCaption: string;
  backHref: string;
  ownerId?: string | null;
}) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const router = useRouter();
  const [caption, setCaption] = useState(initialCaption);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let active = true;

    async function checkOwner() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!active) {
        return;
      }

      setVisible(Boolean(user && ownerId && user.id === ownerId));
    }

    void checkOwner();

    return () => {
      active = false;
    };
  }, [ownerId, supabase]);

  async function handleSave() {
    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from("posts")
        .update({ caption: caption.trim() || null })
        .eq("id", postId);

      if (error) {
        throw error;
      }

      setEditing(false);
      setMessage("Occasion updated.");
      router.refresh();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unable to update occasion.";
      setMessage(errorMessage);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm("Delete this post?");
    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setMessage(null);

    try {
      const { error: postImagesDeleteError } = await supabase.from("post_images").delete().eq("post_id", postId);

      if (postImagesDeleteError) {
        throw postImagesDeleteError;
      }

      const { error: votesDeleteError } = await supabase.from("votes").delete().eq("post_id", postId);

      if (votesDeleteError) {
        throw votesDeleteError;
      }

      const { error: postDeleteError } = await supabase.from("posts").delete().eq("id", postId);

      if (postDeleteError) {
        throw postDeleteError;
      }

      router.replace(backHref);
      router.refresh();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unable to delete post.";
      setMessage(errorMessage);
    } finally {
      setDeleting(false);
    }
  }

  if (!visible) {
    return null;
  }

  return (
    <div className="space-y-3 rounded-[1.2rem] bg-black/28 p-3 backdrop-blur-sm">
      {editing ? (
        <div className="space-y-3">
          <textarea
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            placeholder="Where will you wear this?"
            className="min-h-24 w-full rounded-[1rem] bg-white/10 p-3 text-sm leading-6 text-white outline-none placeholder:text-white/45"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving}
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={() => {
                setCaption(initialCaption);
                setEditing(false);
                setMessage(null);
              }}
              disabled={saving}
              className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900"
          >
            Edit occasion
          </button>
          <button
            type="button"
            onClick={() => void handleDelete()}
            disabled={deleting}
            className="rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {deleting ? "Deleting..." : "Delete post"}
          </button>
        </div>
      )}

      {message ? <p className="text-sm leading-6 text-white/80">{message}</p> : null}
    </div>
  );
}
