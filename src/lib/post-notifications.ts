export async function notifyFollowersOfPost({
  postId,
  userId,
  caption,
}: {
  postId: string;
  userId: string;
  caption: string;
}) {
  await fetch("/api/notify-post", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ postId, userId, caption }),
  });
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
  await fetch("/api/admin/new-post-alert", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ postId, userId, caption, imageUrl }),
  });
}
