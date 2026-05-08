import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { sendTelegramMessage, sendTelegramPhoto } from "@/lib/telegram";

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = createSupabaseAdminClient();
    const body = await request.json();

    const postId = typeof body?.postId === "string" ? body.postId : null;
    const userId = typeof body?.userId === "string" ? body.userId : null;
    const caption = typeof body?.caption === "string" ? body.caption.trim() : "";
    const imageUrl = typeof body?.imageUrl === "string" ? body.imageUrl : "";

    if (!postId || !userId) {
      return NextResponse.json({ error: "postId and userId are required" }, { status: 400 });
    }

    const { data: author } = await supabaseAdmin
      .from("profiles")
      .select("id,display_name,username")
      .eq("id", userId)
      .maybeSingle();

    const reviewBaseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || request.nextUrl.origin;
    const reviewUrl = `${reviewBaseUrl}/admin/posts/${postId}`;
    const authorName = author?.display_name || author?.username || "HowMyLook user";
    const authorUsername = author?.username ? `@${author.username}` : null;
    const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
    const telegramAdminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

    const hasTelegramDelivery = Boolean(telegramBotToken && telegramAdminChatId);

    if (hasTelegramDelivery) {
      const captionLines = [
        "<b>New HowMyLook post</b>",
        authorUsername ? `${authorName} (${authorUsername})` : authorName,
        caption ? `Occasion: ${caption}` : "Occasion: —",
        `<a href=\"${reviewUrl}\">Open admin review</a>`,
      ];

      if (imageUrl.startsWith("http")) {
        await sendTelegramPhoto({
          botToken: telegramBotToken!,
          chatId: telegramAdminChatId!,
          photoUrl: imageUrl,
          caption: captionLines.join("\n"),
        });
      } else {
        await sendTelegramMessage({
          botToken: telegramBotToken!,
          chatId: telegramAdminChatId!,
          text: captionLines.join("\n"),
        });
      }

      const { error: updateError } = await supabaseAdmin
        .from("posts")
        .update({ admin_alert_sent_at: new Date().toISOString() })
        .eq("id", postId);

      if (updateError) {
        throw updateError;
      }
    }

    return NextResponse.json({
      ok: true,
      delivered: hasTelegramDelivery,
      pendingDelivery: !hasTelegramDelivery,
      message: hasTelegramDelivery ? "Admin alert sent." : "Admin alert not configured yet.",
      adminAlert: {
        title: "New HowMyLook post",
        authorName,
        authorUsername,
        caption: caption || null,
        imageUrl: imageUrl || null,
        reviewUrl,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown admin alert error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
