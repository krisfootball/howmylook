"use client";

import { DiscoverCreatorsClient } from "@/components/discover-creators-client";
import { FollowingFeedClient } from "@/components/following-feed-client";

export function FollowingPageClient() {
  return (
    <div className="space-y-5">
      <DiscoverCreatorsClient />
      <FollowingFeedClient />
    </div>
  );
}
