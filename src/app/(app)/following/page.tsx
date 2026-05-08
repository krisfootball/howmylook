import { redirect } from "next/navigation";

export default function FollowingPage() {
  redirect("/home");
}

// Legacy route alias kept so older links continue to work after Home became the main unlocked feed.
