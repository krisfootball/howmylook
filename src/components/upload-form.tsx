"use client";

import { useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

const MAX_FILES = 5;

export function UploadForm() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [caption, setCaption] = useState("");
  const [files, setFiles] = useState<File[]>([]);
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

      const uploadedImageUrls: string[] = [];
      let fallbackImageUrl = `seed://user-post-${Date.now()}`;

      for (const [index, file] of files.entries()) {
        const fileExt = file.name.split(".").pop() || "jpg";
        const filePath = `${user.id}/${Date.now()}-${index}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("post-images")
          .upload(filePath, file, { upsert: false });

        if (uploadError) {
          throw uploadError;
        }

        const { data } = supabase.storage.from("post-images").getPublicUrl(filePath);
        uploadedImageUrls.push(data.publicUrl);
      }

      if (uploadedImageUrls.length > 0) {
        fallbackImageUrl = uploadedImageUrls[0];
      }

      const { data: insertedPosts, error } = await supabase
        .from("posts")
        .insert({
          user_id: user.id,
          image_url: fallbackImageUrl,
          caption: caption.trim() || null,
          yes_count: 0,
          no_count: 0,
          is_active: true,
        })
        .select("id")
        .single();

      if (error) {
        throw error;
      }

      if (uploadedImageUrls.length > 0) {
        const { error: postImagesError } = await supabase.from("post_images").insert(
          uploadedImageUrls.map((imageUrl, index) => ({
            post_id: insertedPosts.id,
            image_url: imageUrl,
            sort_order: index,
          })),
        );

        if (postImagesError) {
          throw postImagesError;
        }
      }

      setCaption("");
      setFiles([]);
      setMessage(
        uploadedImageUrls.length > 1
          ? `Post created with ${uploadedImageUrls.length} photos.`
          : uploadedImageUrls.length === 1
            ? "Post created with 1 photo."
            : "Post created without photos.",
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unable to create post.";
      const lower = errorMessage.toLowerCase();
      const friendlyMessage =
        lower.includes("post_images") || lower.includes("relation \"post_images\"")
          ? "Multi-photo posts need one Supabase SQL migration first. Run SUPABASE_MIGRATION_POST_IMAGES.sql in Supabase, then try again."
          : lower.includes("bucket")
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
        <h2 className="mt-4 text-lg font-semibold tracking-tight text-slate-900">Upload outfit photos</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Photos are optional for now. You can attach up to 5 images once the Supabase storage bucket is ready.
        </p>
        <label className="mt-4 block rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm">
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(event) => {
              const nextFiles = Array.from(event.target.files ?? []).slice(0, MAX_FILES);
              setFiles(nextFiles);
            }}
          />
          {files.length > 0 ? `${files.length} photo${files.length > 1 ? "s" : ""} selected` : "Choose up to 5 photos"}
        </label>
        {files.length > 0 ? (
          <div className="mt-3 text-left text-xs text-slate-500">
            {files.map((file) => (
              <p key={`${file.name}-${file.size}`}>• {file.name}</p>
            ))}
          </div>
        ) : null}
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
