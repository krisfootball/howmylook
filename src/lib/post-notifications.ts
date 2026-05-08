async function postJson(url: string, payload: Record<string, unknown>) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data && typeof data === "object" && "error" in data && typeof data.error === "string"
        ? data.error
        : `Request failed: ${response.status}`;

    throw new Error(message);
  }

  return data;
}

export async function notifyFollowersOfPost({
  postId,
  userId,
  caption,
}: {
  postId: string;
  userId: string;
  caption: string;
}) {
  return postJson("/api/notify-post", { postId, userId, caption });
}

export async function notifyAdminOfPost({
  postId,
  userId,
  caption,
  imageUrl,
}: {
  postId: string;
  userId: string;
  caption: string;
  imageUrl: string;
}) {
  return postJson("/api/admin/new-post-alert", { postId, userId, caption, imageUrl });
}
