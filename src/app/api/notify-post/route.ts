import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

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

    const authorName = author?.display_name || author?.username || "Someone you follow";
    const trimmedCaption = caption?.trim();
    const shortCaption = trimmedCaption
      ? trimmedCaption.length > 72
        ? `${trimmedCaption.slice(0, 69).trimEnd()}...`
        : trimmedCaption
      : null;

    const payload = JSON.stringify({
      title: `${authorName} posted a new look ✨`,
      body: shortCaption ? shortCaption : "Tap to see the fit.",
      url: `/profile/${postId}?from=home`,
    });

    let delivered = 0;
    let removed = 0;

    for (const subscription of subscriptions ?? []) {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          },
          payload,
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

    return NextResponse.json({ ok: true, delivered, removed });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown notification error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
