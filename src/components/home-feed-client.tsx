"use client";

import { FollowingFeedClient } from "@/components/following-feed-client";

export function HomeFeedClient() {
  return (
    <div className="space-y-5">
      <FollowingFeedClient />
    </div>
  );
}
