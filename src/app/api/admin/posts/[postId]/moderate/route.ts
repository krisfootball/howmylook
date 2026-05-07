import { NextRequest, NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

type ModerationStatus = "approved" | "hidden" | "deleted" | "pending";

function getReason(status: ModerationStatus) {
  if (status === "hidden") {
    return "Hidden by admin review";
  }

  if (status === "deleted") {
    return "Deleted by admin review";
  }

  return null;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  try {
    const adminUser = await requireAdminUser();

    if (!adminUser) {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }

    const { postId } = await params;
    const body = await request.json();
    const status = body?.status as ModerationStatus | undefined;

    if (!postId) {
      return NextResponse.json({ error: "Missing post id." }, { status: 400 });
    }

    if (!status || !["approved", "hidden", "deleted", "pending"].includes(status)) {
      return NextResponse.json({ error: "Invalid moderation status." }, { status: 400 });
    }

    const supabaseAdmin = createSupabaseAdminClient();
    const nextActive = status === "deleted" ? false : true;

    const moderatedAt = new Date().toISOString();

    const { data: post, error: postLookupError } = await supabaseAdmin
      .from("posts")
      .select("id,user_id,caption")
      .eq("id", postId)
      .maybeSingle();

    if (postLookupError || !post) {
      return NextResponse.json({ error: postLookupError?.message || "Post not found." }, { status: 404 });
    }

    const { error } = await supabaseAdmin
      .from("posts")
      .update({
        moderation_status: status,
        moderation_reason: getReason(status),
        moderated_at: moderatedAt,
        moderated_by: adminUser.id,
        is_active: nextActive,
      })
      .eq("id", postId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (status === "deleted") {
      const { error: notificationError } = await supabaseAdmin
        .from("user_notifications")
        .insert({
          user_id: post.user_id,
          kind: "moderation_removed",
          title: "Your post was removed because it didn’t fit HowMyLook guidelines.",
          body: post.caption?.trim() || null,
          post_id: post.id,
          created_at: moderatedAt,
        });

      if (notificationError) {
        return NextResponse.json({ error: notificationError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update moderation status.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
