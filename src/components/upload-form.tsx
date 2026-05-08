"use client";

import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { notifyAdminOfPost, notifyFollowersOfPost } from "@/lib/post-notifications";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

const MAX_FILES = 5;
const MAX_OCCASION_LENGTH = 100;
const MAX_UPLOAD_DIMENSION = 1600;
const UPLOAD_QUALITY = 0.82;

export function UploadForm() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const router = useRouter();
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const [caption, setCaption] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function applyFiles(nextFiles: File[]) {
    setFiles(nextFiles.slice(0, MAX_FILES));
  }

  async function compressImage(file: File) {
    if (typeof window === "undefined") {
      return file;
    }

    if (!file.type.startsWith("image/")) {
      return file;
    }

    const objectUrl = URL.createObjectURL(file);

    try {
      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("Could not load image for compression."));
        img.src = objectUrl;
      });

      const longestSide = Math.max(image.width, image.height);
      const scale = longestSide > MAX_UPLOAD_DIMENSION ? MAX_UPLOAD_DIMENSION / longestSide : 1;
      const targetWidth = Math.max(1, Math.round(image.width * scale));
      const targetHeight = Math.max(1, Math.round(image.height * scale));

      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const context = canvas.getContext("2d");
      if (!context) {
        return file;
      }

      context.drawImage(image, 0, 0, targetWidth, targetHeight);

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/jpeg", UPLOAD_QUALITY);
      });

      if (!blob) {
        return file;
      }

      const baseName = file.name.replace(/\.[^.]+$/, "") || "photo";
      return new File([blob], `${baseName}.jpg`, {
        type: "image/jpeg",
        lastModified: Date.now(),
      });
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }

  function moveFile(fromIndex: number, toIndex: number) {
    setFiles((current) => {
      if (toIndex < 0 || toIndex >= current.length) {
        return current;
      }

      const next = [...current];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
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

      setMessage(files.length > 1 ? "Optimizing photos..." : "Optimizing photo...");
      const preparedFiles = await Promise.all(files.map((file) => compressImage(file)));
      setMessage(preparedFiles.length > 1 ? "Uploading optimized photos..." : "Uploading optimized photo...");

      for (const [index, file] of preparedFiles.entries()) {
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
          moderation_status: "approved",
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

      let notificationNote = "";

      const [followersResult, adminResult] = await Promise.allSettled([
        notifyFollowersOfPost({
          postId: insertedPosts.id,
          userId: user.id,
          caption: caption.trim(),
        }),
        notifyAdminOfPost({
          postId: insertedPosts.id,
          userId: user.id,
          caption: caption.trim(),
          imageUrl: fallbackImageUrl,
        }),
      ]);

      const notificationWarnings: string[] = [];

      if (followersResult.status === "rejected") {
        notificationWarnings.push("Follower notifications need more setup.");
      }

      if (adminResult.status === "rejected") {
        notificationWarnings.push("Admin alert delivery failed.");
      } else if (
        adminResult.value &&
        typeof adminResult.value === "object" &&
        "pendingDelivery" in adminResult.value &&
        adminResult.value.pendingDelivery
      ) {
        notificationWarnings.push("Admin Telegram alert is not configured yet.");
      }

      if (notificationWarnings.length > 0) {
        notificationNote = ` ${notificationWarnings.join(" ")}`;
      }

      setCaption("");
      setFiles([]);
      if (galleryInputRef.current) {
        galleryInputRef.current.value = "";
      }
      if (cameraInputRef.current) {
        cameraInputRef.current.value = "";
      }
      const successMessage =
        uploadedImageUrls.length > 1
          ? `Post created with ${uploadedImageUrls.length} photos.${notificationNote}`
          : `Post created with 1 photo.${notificationNote}`;

      setMessage(successMessage);
      router.push(`/post/${insertedPosts.id}?from=profile&posted=1`);
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
              setMessage(`Camera photo ready: ${nextFiles[0].name}. It will be optimized before upload.`);
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
                  ? `${Math.min(nextFiles.length, MAX_FILES)} photos selected. They will be optimized before upload.`
                  : `${nextFiles[0].name} selected. It will be optimized before upload.`,
              );
            }
          }}
        />

        {files.length > 0 ? (
          <div className="mt-4 rounded-[1.2rem] bg-white p-3 text-left text-xs text-slate-500 shadow-sm">
            <p className="font-semibold text-slate-900">Ready to upload</p>
            <p className="mt-1 text-xs text-slate-500">Reorder photos before publishing. Photos will be resized for faster upload.</p>
            <div className="mt-3 space-y-2">
              {files.map((file, index) => (
                <div key={`${file.name}-${file.size}`} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">{index + 1}. {file.name}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => moveFile(index, index - 1)}
                      disabled={index === 0}
                      className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 disabled:opacity-40"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveFile(index, index + 1)}
                      disabled={index === files.length - 1}
                      className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 disabled:opacity-40"
                    >
                      ↓
                    </button>
                  </div>
                </div>
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
          onChange={(event) => setCaption(event.target.value.slice(0, MAX_OCCASION_LENGTH))}
          placeholder="Where will you wear this?"
          maxLength={MAX_OCCASION_LENGTH}
          className="mt-3 min-h-28 w-full rounded-[1.2rem] bg-slate-50 p-4 text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-400"
        />
        <div className="mt-2 text-right text-xs text-slate-400">
          {caption.length}/{MAX_OCCASION_LENGTH}
        </div>
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
