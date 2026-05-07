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

    const { error } = await supabaseAdmin
      .from("posts")
      .update({
        moderation_status: status,
        moderation_reason: getReason(status),
        moderated_at: new Date().toISOString(),
        moderated_by: adminUser.id,
        is_active: nextActive,
      })
      .eq("id", postId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update moderation status.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
