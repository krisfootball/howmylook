"use client";

import { useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export function PushNotificationToggle({
  followingId,
  initialEnabled,
  disabled = false,
  onChanged,
}: {
  followingId: string;
  initialEnabled: boolean;
  disabled?: boolean;
  onChanged?: (enabled: boolean) => void;
}) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [enabled, setEnabled] = useState(initialEnabled);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleToggle() {
    if (disabled) {
      return;
    }

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
        throw new Error("Sign in to manage notifications.");
      }

      const nextEnabled = !enabled;

      if (nextEnabled) {
        if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
          throw new Error("Push notifications are not supported on this device/browser.");
        }

        if (!VAPID_PUBLIC_KEY) {
          throw new Error("Push notifications need NEXT_PUBLIC_VAPID_PUBLIC_KEY configured first.");
        }

        const permission = await Notification.requestPermission();

        if (permission !== "granted") {
          throw new Error("Allow notifications on your device to turn this on.");
        }

        const registration = await navigator.serviceWorker.register("/sw.js");
        const existingSubscription = await registration.pushManager.getSubscription();
        const subscription =
          existingSubscription ??
          (await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
          }));

        const subscriptionJson = subscription.toJSON();

        const { error: subscriptionError } = await supabase.from("push_subscriptions").upsert(
          {
            user_id: user.id,
            endpoint: subscription.endpoint,
            p256dh: subscriptionJson.keys?.p256dh ?? "",
            auth: subscriptionJson.keys?.auth ?? "",
            user_agent: navigator.userAgent,
            last_seen_at: new Date().toISOString(),
          },
          { onConflict: "endpoint" },
        );

        if (subscriptionError) {
          throw subscriptionError;
        }
      }

      const { error: followError } = await supabase
        .from("follows")
        .update({ notifications_enabled: nextEnabled, notifications_enabled_at: nextEnabled ? new Date().toISOString() : null })
        .eq("follower_id", user.id)
        .eq("following_id", followingId);

      if (followError) {
        throw followError;
      }

      setEnabled(nextEnabled);
      setMessage(nextEnabled ? "Notifications on." : "Notifications off.");
      onChanged?.(nextEnabled);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unable to update notifications.";
      const lower = errorMessage.toLowerCase();
      const friendlyMessage =
        lower.includes("push_subscriptions") ||
        lower.includes("notifications_enabled") ||
        lower.includes("row-level security") ||
        lower.includes("permission")
          ? "Notifications UI is ready, but Supabase still needs the push notification SQL + policies applied."
          : errorMessage;
      setMessage(friendlyMessage);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => void handleToggle()}
        disabled={disabled || saving}
        className={`rounded-full px-4 py-2 text-sm font-semibold ${
          enabled ? "bg-slate-900 text-white" : "bg-white text-slate-700 ring-1 ring-slate-200"
        } disabled:opacity-60`}
      >
        {saving ? "Saving..." : enabled ? "Notifications on" : "Notify me"}
      </button>

      {message ? <p className="text-xs leading-5 text-slate-500">{message}</p> : null}
    </div>
  );
}
