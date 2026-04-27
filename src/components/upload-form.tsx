"use client";

import { useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export function UploadForm() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        throw new Error("Sign in first before creating a post.");
      }

      let imageUrl = `seed://user-post-${Date.now()}`;

      if (file) {
        const fileExt = file.name.split(".").pop() || "jpg";
        const filePath = `${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("post-images")
          .upload(filePath, file, { upsert: false });

        if (uploadError) {
          throw uploadError;
        }

        const { data } = supabase.storage.from("post-images").getPublicUrl(filePath);
        imageUrl = data.publicUrl;
      }

      const { error } = await supabase.from("posts").insert({
        user_id: user.id,
        image_url: imageUrl,
        caption: caption.trim() || null,
        yes_count: 0,
        no_count: 0,
        is_active: true,
      });

      if (error) {
        throw error;
      }

      setCaption("");
      setFile(null);
      setMessage(file ? "Post created with uploaded image." : "Post created. Add a photo next for the full flow.");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unable to create post.";
      const friendlyMessage = errorMessage.toLowerCase().includes("bucket")
        ? "Photo upload is almost ready, but the Supabase storage bucket still needs setup. Run SUPABASE_STORAGE_SETUP.sql in Supabase, then try again."
        : errorMessage;
      setMessage(friendlyMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <section className="rounded-[1.7rem] border border-dashed border-pink-200 bg-pink-50/70 p-5 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-2xl shadow-sm">
          📷
        </div>
        <h2 className="mt-4 text-lg font-semibold tracking-tight text-slate-900">Upload outfit photo</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          You can now attach a real image once the Supabase storage bucket is ready.
        </p>
        <label className="mt-4 block rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
          {file ? `Selected: ${file.name}` : "Choose photo"}
        </label>
      </section>

      <section className="rounded-[1.7rem] border border-pink-100 bg-white p-4 shadow-sm">
        <label className="text-sm font-semibold text-slate-900">Caption</label>
        <textarea
          value={caption}
          onChange={(event) => setCaption(event.target.value)}
          placeholder="Wedding guest dress for next Saturday — yes or no?"
          className="mt-3 min-h-28 w-full rounded-[1.2rem] bg-slate-50 p-4 text-sm leading-6 text-slate-900 outline-none"
        />
      </section>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-pink-500 px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-pink-500/20 disabled:opacity-60"
      >
        {loading ? "Publishing..." : "Publish look"}
      </button>

      {message ? (
        <div
          className={`rounded-[1.2rem] px-4 py-3 text-sm leading-6 shadow-sm ${
            message.toLowerCase().includes("unable") ||
            message.toLowerCase().includes("error") ||
            message.toLowerCase().includes("sign in") ||
            message.toLowerCase().includes("bucket")
              ? "bg-rose-50 text-rose-700"
              : "bg-white text-slate-600"
          }`}
        >
          {message}
        </div>
      ) : null}
    </form>
  );
}
