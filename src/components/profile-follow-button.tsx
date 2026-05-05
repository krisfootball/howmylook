"use client";

import { useEffect, useMemo, useState } from "react";
import { PushNotificationToggle } from "@/components/push-notification-toggle";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export function ProfileFollowButton({ profileId }: { profileId: string }) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        if (!user) {
          if (!active) return;
          setError("Sign in to follow people.");
          setLoading(false);
          return;
        }

        if (user.id === profileId) {
          if (!active) return;
          setIsOwnProfile(true);
          setLoading(false);
          return;
        }

        const { data: existingFollow, error: followError } = await supabase
          .from("follows")
          .select("follower_id,notifications_enabled")
          .eq("follower_id", user.id)
          .eq("following_id", profileId)
          .maybeSingle();

        if (followError) {
          throw followError;
        }

        if (!active) return;
        setIsFollowing(Boolean(existingFollow));
        setNotificationsEnabled(Boolean(existingFollow?.notifications_enabled));
        setError(null);
      } catch (loadError) {
        if (!active) return;
        const message = loadError instanceof Error ? loadError.message : "Unable to load follow state.";
        setError(message);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [profileId, supabase]);

  async function handleToggleFollow() {
    setSaving(true);
    setError(null);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        throw new Error("Sign in to follow people.");
      }

      if (isFollowing) {
        const { error: deleteError } = await supabase
          .from("follows")
          .delete()
          .eq("follower_id", user.id)
          .eq("following_id", profileId);

        if (deleteError) {
          throw deleteError;
        }

        setIsFollowing(false);
        setNotificationsEnabled(false);
      } else {
        const { error: insertError } = await supabase.from("follows").insert({
          follower_id: user.id,
          following_id: profileId,
        });

        if (insertError) {
          throw insertError;
        }

        setIsFollowing(true);
        setNotificationsEnabled(false);
      }
    } catch (toggleError) {
      const message = toggleError instanceof Error ? toggleError.message : "Unable to update following.";
      const friendlyMessage =
        message.toLowerCase().includes("row-level security") || message.toLowerCase().includes("permission")
          ? "Following is wired in the app, but Supabase still needs the RLS policies from SUPABASE_RLS_SETUP.sql applied."
          : message;
      setError(friendlyMessage);
    } finally {
      setSaving(false);
    }
  }

  if (loading || isOwnProfile) {
    return null;
  }

  return (
    <div className="mt-4 flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void handleToggleFollow()}
          disabled={saving}
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            isFollowing ? "bg-white text-slate-700 ring-1 ring-slate-200" : "bg-pink-500 text-white shadow-lg shadow-pink-500/20"
          } disabled:opacity-60`}
        >
          {saving ? "Saving..." : isFollowing ? "Following" : "Follow"}
        </button>

        {isFollowing ? (
          <PushNotificationToggle
            followingId={profileId}
            initialEnabled={notificationsEnabled}
            onChanged={setNotificationsEnabled}
          />
        ) : null}
      </div>

      {error ? <p className="text-sm leading-6 text-rose-700">{error}</p> : null}
    </div>
  );
}
