"use client";

import { useState } from "react";
import { DiscoverCreatorsClient } from "@/components/discover-creators-client";
import { FollowingFeedClient } from "@/components/following-feed-client";

export function HomeFeedClient() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-5">
      <DiscoverCreatorsClient
        onChanged={() => setRefreshKey((current) => current + 1)}
      />

      <FollowingFeedClient refreshKey={refreshKey} />
    </div>
  );
}
