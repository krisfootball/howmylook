import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { getFirebaseMessaging } from "@/lib/firebase-admin";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

type BrowserSubscriptionRow = {
  endpoint: string;
  p256dh: string;
  auth: string;
  user_id: string;
};

type AndroidDeviceRow = {
  token: string;
  user_id: string;
};

export async function POST(request: NextRequest) {
  try {
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
    const vapidSubject = process.env.VAPID_SUBJECT;

    if (!vapidPublicKey) {
      return NextResponse.json({ error: "Missing NEXT_PUBLIC_VAPID_PUBLIC_KEY" }, { status: 500 });
    }

    if (!vapidPrivateKey) {
      return NextResponse.json({ error: "Missing VAPID_PRIVATE_KEY" }, { status: 500 });
    }

    if (!vapidSubject) {
      return NextResponse.json({ error: "Missing VAPID_SUBJECT" }, { status: 500 });
    }

    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
    const supabaseAdmin = createSupabaseAdminClient();

    const body = await request.json();
    const postId = typeof body?.postId === "string" ? body.postId : null;
    const userId = typeof body?.userId === "string" ? body.userId : null;
    const caption = typeof body?.caption === "string" ? body.caption : "";

    if (!postId || !userId) {
      return NextResponse.json({ error: "postId and userId are required" }, { status: 400 });
    }

    const { data: author } = await supabaseAdmin
      .from("profiles")
      .select("id,display_name,username")
      .eq("id", userId)
      .maybeSingle();

    const { data: followRows, error: followsError } = await supabaseAdmin
      .from("follows")
      .select("follower_id")
      .eq("following_id", userId)
      .eq("notifications_enabled", true);

    if (followsError) {
      throw followsError;
    }

    const followerIds = Array.from(new Set((followRows ?? []).map((row) => row.follower_id).filter(Boolean)));

    if (followerIds.length === 0) {
      return NextResponse.json({ ok: true, delivered: 0, reason: "no followers opted in" });
    }

    const { data: subscriptions, error: subscriptionsError } = await supabaseAdmin
      .from("push_subscriptions")
      .select("endpoint,p256dh,auth,user_id")
      .in("user_id", followerIds);

    if (subscriptionsError) {
      throw subscriptionsError;
    }

    const { data: androidDevices, error: androidDevicesError } = await supabaseAdmin
      .from("android_push_devices")
      .select("token,user_id")
      .in("user_id", followerIds);

    if (androidDevicesError) {
      throw androidDevicesError;
    }

    const authorName = author?.display_name || author?.username || "Someone you follow";
    const trimmedCaption = caption?.trim();
    const shortCaption = trimmedCaption
      ? trimmedCaption.length > 72
        ? `${trimmedCaption.slice(0, 69).trimEnd()}...`
        : trimmedCaption
      : null;

    const webPayload = JSON.stringify({
      title: `${authorName} posted a new look ✨`,
      body: shortCaption ? shortCaption : "Tap to see the fit.",
      url: `/post/${postId}?from=home`,
    });

    const androidPayload = {
      title: `${authorName} posted a new look ✨`,
      body: shortCaption ? shortCaption : "Tap to see the fit.",
      postId,
      profileId: userId,
    };

    let delivered = 0;
    let removed = 0;
    let androidDelivered = 0;
    let androidRemoved = 0;

    for (const subscription of (subscriptions ?? []) as BrowserSubscriptionRow[]) {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          },
          webPayload,
        );
        delivered += 1;
      } catch (error) {
        const statusCode = typeof error === "object" && error !== null && "statusCode" in error ? Number(error.statusCode) : null;

        if (statusCode === 404 || statusCode === 410) {
          const { error: deleteError } = await supabaseAdmin
            .from("push_subscriptions")
            .delete()
            .eq("endpoint", subscription.endpoint);

          if (!deleteError) {
            removed += 1;
          }
        }
      }
    }

    const androidTokens = Array.from(new Set(((androidDevices ?? []) as AndroidDeviceRow[]).map((row) => row.token).filter(Boolean)));

    if (androidTokens.length > 0) {
      const messaging = getFirebaseMessaging();
      const response = await messaging.sendEachForMulticast({
        tokens: androidTokens,
        data: androidPayload,
        android: {
          priority: "high",
        },
      });

      androidDelivered = response.successCount;

      const invalidTokens = response.responses
        .map((item, index) => ({ item, token: androidTokens[index] }))
        .filter(({ item }) => !item.success)
        .filter(({ item }) => {
          const code = item.error?.code ?? "";
          return code.includes("registration-token-not-registered") || code.includes("invalid-registration-token");
        })
        .map(({ token }) => token);

      if (invalidTokens.length > 0) {
        const { error: deleteAndroidTokensError } = await supabaseAdmin
          .from("android_push_devices")
          .delete()
          .in("token", invalidTokens);

        if (!deleteAndroidTokensError) {
          androidRemoved = invalidTokens.length;
        }
      }
    }

    return NextResponse.json({ ok: true, delivered, removed, androidDelivered, androidRemoved });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown notification error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
