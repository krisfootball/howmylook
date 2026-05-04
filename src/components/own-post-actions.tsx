"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export function OwnPostActions({
  postId,
  initialCaption,
  backHref,
  ownerId,
  isKeptForever = false,
  compact = false,
}: {
  postId: string;
  initialCaption: string;
  backHref: string;
  ownerId?: string | null;
  isKeptForever?: boolean;
  compact?: boolean;
}) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const router = useRouter();
  const [caption, setCaption] = useState(initialCaption);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [keptForever, setKeptForever] = useState(isKeptForever);

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

  async function handleToggleKeep() {
    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from("posts")
        .update({ keep_forever: !keptForever })
        .eq("id", postId);

      if (error) {
        throw error;
      }

      setKeptForever((current) => !current);
      setMenuOpen(false);
      setMessage(!keptForever ? "Photo kept on profile." : "Photo will expire normally again.");
      router.refresh();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unable to update keep setting.";
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

  if (compact) {
    return (
      <div className="pointer-events-auto relative flex items-start justify-end">
        <button
          type="button"
          onClick={() => setMenuOpen((current) => !current)}
          className="rounded-full bg-black/35 px-3 py-2 text-lg font-semibold leading-none text-white shadow-[0_10px_30px_rgba(0,0,0,0.18)] backdrop-blur-sm"
        >
          ⋯
        </button>

        {menuOpen ? (
          <div className="absolute right-0 top-12 z-20 w-44 rounded-[1.2rem] bg-white p-2 text-slate-900 shadow-[0_20px_50px_rgba(15,23,42,0.22)]">
            <button type="button" onClick={() => void handleToggleKeep()} disabled={saving} className="block w-full rounded-xl px-3 py-2 text-left text-sm font-medium hover:bg-slate-50 disabled:opacity-60">
              {saving ? "Saving..." : keptForever ? "Unkeep photo" : "Keep photo"}
            </button>
            <button type="button" onClick={() => { setEditing(true); setMenuOpen(false); }} className="block w-full rounded-xl px-3 py-2 text-left text-sm font-medium hover:bg-slate-50">
              Edit photo
            </button>
            <button type="button" onClick={() => void handleDelete()} disabled={deleting} className="block w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-60">
              {deleting ? "Deleting..." : "Delete photo"}
            </button>
          </div>
        ) : null}

        {editing ? (
          <div className="absolute right-0 top-12 z-20 mt-2 w-72 rounded-[1.2rem] bg-white p-3 text-slate-900 shadow-[0_20px_50px_rgba(15,23,42,0.22)]">
            <div className="space-y-3">
              <textarea
                value={caption}
                onChange={(event) => setCaption(event.target.value)}
                placeholder="Where will you wear this?"
                className="min-h-24 w-full rounded-[1rem] bg-slate-50 p-3 text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-400"
              />
              <div className="flex gap-2">
                <button type="button" onClick={() => void handleSave()} disabled={saving} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                  {saving ? "Saving..." : "Save"}
                </button>
                <button type="button" onClick={() => { setCaption(initialCaption); setEditing(false); }} disabled={saving} className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-60">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {message ? (
          <div className="absolute right-0 top-[4.6rem] z-10 mt-2 max-w-56 rounded-[1rem] bg-black/45 px-3 py-2 text-right text-xs leading-5 text-white backdrop-blur-sm">
            {message}
          </div>
        ) : null}
      </div>
    );
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
            onClick={() => void handleToggleKeep()}
            disabled={saving}
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 disabled:opacity-60"
          >
            {saving ? "Saving..." : keptForever ? "Unkeep photo" : "Keep photo"}
          </button>
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
