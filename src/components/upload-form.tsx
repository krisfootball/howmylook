"use client";

import { useMemo, useRef, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

const MAX_FILES = 5;
const MAX_KEPT_POSTS = 10;
const POST_LIFETIME_DAYS = 30;

export function UploadForm() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const [caption, setCaption] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function applyFiles(nextFiles: File[]) {
    setFiles(nextFiles.slice(0, MAX_FILES));
  }

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

      if (files.length === 0) {
        throw new Error("Add at least 1 photo before publishing.");
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
          throw new Error(`Photo upload failed: ${uploadError.message}`);
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
          keep_forever: false,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select("id")
        .single();

      if (error) {
        throw new Error(`Post insert failed: ${error.message}`);
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
          throw new Error(`Post images insert failed: ${postImagesError.message}`);
        }
      }

      setCaption("");
      setFiles([]);
      if (galleryInputRef.current) {
        galleryInputRef.current.value = "";
      }
      if (cameraInputRef.current) {
        cameraInputRef.current.value = "";
      }
      setMessage(
        uploadedImageUrls.length > 1
          ? `Post created with ${uploadedImageUrls.length} photos.`
          : "Post created with 1 photo.",
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unable to create post.";
      const lower = errorMessage.toLowerCase();
      const friendlyMessage =
        lower.includes("post_images") || lower.includes('relation "post_images"')
          ? "Multi-photo posts need one Supabase SQL migration first. Run SUPABASE_MIGRATION_POST_IMAGES.sql in Supabase, then try again."
          : lower.includes("bucket")
            ? "Photo upload is almost ready, but the Supabase storage bucket still needs setup. Run SUPABASE_STORAGE_SETUP.sql in Supabase, then try again."
            : lower === "unable to create post."
              ? "Unable to create post. The exact Supabase error did not come through cleanly yet."
              : `Unable to create post: ${errorMessage}`;
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
          Take a photo directly with your camera or choose up to 5 images from your gallery.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm"
          >
            Take photo
          </button>
          <button
            type="button"
            onClick={() => galleryInputRef.current?.click()}
            className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-pink-100"
          >
            Choose photos
          </button>
        </div>

        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(event) => {
            const nextFiles = Array.from(event.target.files ?? []);
            if (nextFiles.length > 0) {
              applyFiles(nextFiles);
              setMessage(`Camera photo ready: ${nextFiles[0].name}`);
            }
          }}
        />

        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(event) => {
            const nextFiles = Array.from(event.target.files ?? []);
            if (nextFiles.length > 0) {
              applyFiles(nextFiles);
              setMessage(
                nextFiles.length > 1
                  ? `${Math.min(nextFiles.length, MAX_FILES)} photos selected.`
                  : `${nextFiles[0].name} selected.`,
              );
            }
          }}
        />

        {files.length > 0 ? (
          <div className="mt-4 rounded-[1.2rem] bg-white p-3 text-left text-xs text-slate-500 shadow-sm">
            <p className="font-semibold text-slate-900">Ready to upload</p>
            <div className="mt-2 space-y-1">
              {files.map((file) => (
                <p key={`${file.name}-${file.size}`}>• {file.name}</p>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <section className="rounded-[1.7rem] border border-pink-100 bg-white p-4 shadow-sm">
        <label className="text-sm font-semibold text-slate-900">Occasion</label>
        <p className="mt-2 text-xs leading-5 text-slate-500">Help people understand where you plan to wear this outfit.</p>
        <textarea
          value={caption}
          onChange={(event) => setCaption(event.target.value)}
          placeholder="Where will you wear this?"
          className="mt-3 min-h-28 w-full rounded-[1.2rem] bg-slate-50 p-4 text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-400"
        />
      </section>

      <section className="rounded-[1.4rem] border border-pink-100 bg-pink-50/70 p-4 text-sm leading-6 text-slate-700">
        Posts auto-delete after {POST_LIFETIME_DAYS} days by default. You can keep up to {MAX_KEPT_POSTS} looks on your profile for longer.
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
