"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;

export function EditProfileForm({
  onSaved,
}: {
  onSaved?: () => void;
}) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        if (!user) {
          throw new Error("Sign in to edit your profile.");
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("username,display_name,bio,avatar_url")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) {
          throw profileError;
        }

        setUsername(profile?.username ?? "");
        setDisplayName(profile?.display_name ?? "");
        setBio(profile?.bio ?? "");
        setAvatarUrl(profile?.avatar_url ?? null);
        setRemoveAvatar(false);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unable to load your profile.";
        setMessage(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [supabase]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
        throw new Error("Sign in to edit your profile.");
      }

      const cleanUsername = username.trim().toLowerCase();

      if (!cleanUsername) {
        throw new Error("Username is required.");
      }

      if (cleanUsername.length < 3) {
        throw new Error("Username must be at least 3 characters.");
      }

      const { data: existingUsername, error: existingUsernameError } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", cleanUsername)
        .neq("id", user.id)
        .maybeSingle();

      if (existingUsernameError) {
        throw existingUsernameError;
      }

      if (existingUsername) {
        throw new Error("That username is already taken.");
      }

      let nextAvatarUrl = removeAvatar ? null : avatarUrl;
      let avatarWarning: string | null = null;

      if (avatarFile) {
        if (avatarFile.size > MAX_AVATAR_SIZE_BYTES) {
          throw new Error("Profile photo must be 5 MB or smaller.");
        }

        const fileExt = avatarFile.name.split(".").pop() || "jpg";
        const filePath = `${user.id}/avatar-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("profile-avatars")
          .upload(filePath, avatarFile, { upsert: true });

        if (uploadError) {
          const uploadMessage = uploadError.message.toLowerCase();

          if (uploadMessage.includes("bucket") || uploadMessage.includes("profile-avatars")) {
            avatarWarning = "Text profile changes were saved, but profile photo upload still needs SUPABASE_STORAGE_PROFILE_AVATARS.sql run in Supabase.";
          } else {
            throw new Error(`Profile photo upload failed: ${uploadError.message}`);
          }
        } else {
          const { data } = supabase.storage.from("profile-avatars").getPublicUrl(filePath);
          nextAvatarUrl = data.publicUrl;
        }
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          username: cleanUsername,
          display_name: displayName.trim() || null,
          bio: bio.trim() || null,
          avatar_url: nextAvatarUrl,
        })
        .eq("id", user.id);

      if (updateError) {
        throw updateError;
      }

      setAvatarUrl(nextAvatarUrl ?? null);
      setAvatarFile(null);
      setMessage(avatarWarning ?? "Profile updated.");

      if (avatarWarning) {
        return;
      }

      window.setTimeout(() => {
        onSaved?.();
      }, 600);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unable to update profile.";
      const lower = errorMessage.toLowerCase();
      const friendlyMessage =
        lower.includes("bucket") || lower.includes("profile-avatars")
          ? "Profile photo upload needs one Supabase storage setup first. Run SUPABASE_STORAGE_PROFILE_AVATARS.sql in Supabase, then try again."
          : errorMessage;
      setMessage(friendlyMessage);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-4 rounded-[1.6rem] border border-pink-100 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-4">
        {avatarUrl && !removeAvatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt="Your profile photo" className="h-16 w-16 rounded-full object-cover shadow-sm" />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[linear-gradient(180deg,_#f6c4d5_0%,_#ddb7ff_100%)] text-2xl shadow-sm">
            ✨
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900">Profile photo</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">Upload a square photo if you can. Max 5 MB. This is optional.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <label className="inline-flex cursor-pointer rounded-full bg-pink-50 px-4 py-2 text-sm font-semibold text-pink-700 ring-1 ring-pink-200">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={loading || saving}
                onChange={(event) => {
                  const nextFile = event.target.files?.[0] ?? null;
                  setAvatarFile(nextFile);
                  setRemoveAvatar(false);
                  if (nextFile) {
                    setMessage(`Selected ${nextFile.name}`);
                  }
                }}
              />
              {avatarFile ? "Change selected photo" : avatarUrl && !removeAvatar ? "Change photo" : "Choose photo"}
            </label>
            {avatarUrl && !removeAvatar ? (
              <button
                type="button"
                onClick={() => {
                  setAvatarFile(null);
                  setRemoveAvatar(true);
                  setMessage("Profile photo will be removed when you save.");
                }}
                disabled={loading || saving}
                className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 disabled:opacity-60"
              >
                Remove photo
              </button>
            ) : null}
            {removeAvatar ? (
              <button
                type="button"
                onClick={() => {
                  setRemoveAvatar(false);
                  setMessage("Photo removal canceled.");
                }}
                disabled={loading || saving}
                className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 disabled:opacity-60"
              >
                Keep current photo
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-slate-900">Username</label>
        <input
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className="mt-2 w-full rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none ring-0"
          minLength={3}
          required
          disabled={loading || saving}
        />
        <p className="mt-2 text-xs text-slate-500">At least 3 characters. Letters and numbers work best.</p>
      </div>

      <div>
        <label className="text-sm font-semibold text-slate-900">Display name</label>
        <input
          type="text"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          className="mt-2 w-full rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none ring-0"
          disabled={loading || saving}
        />
      </div>

      <div>
        <label className="text-sm font-semibold text-slate-900">Bio</label>
        <textarea
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          placeholder="What kind of looks do you post?"
          className="mt-2 min-h-24 w-full rounded-xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-900 shadow-sm outline-none ring-0 placeholder:text-slate-400"
          disabled={loading || saving}
        />
      </div>

      <button
        type="submit"
        disabled={loading || saving}
        className="w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {loading ? "Loading..." : saving ? "Saving..." : "Save profile"}
      </button>

      {message ? (
        <div
          className={`rounded-[1.2rem] px-4 py-3 text-sm leading-6 ${
            message.toLowerCase().includes("updated") ||
            message.toLowerCase().includes("selected") ||
            message.toLowerCase().includes("text profile changes were saved") ||
            message.toLowerCase().includes("will be removed") ||
            message.toLowerCase().includes("canceled")
              ? "bg-pink-50 text-slate-700"
              : "bg-rose-50 text-rose-700"
          }`}
        >
          {message}
        </div>
      ) : null}
    </form>
  );
}
