import { ActivityFeedClient } from "@/components/activity-feed-client";
import { MobileShell } from "@/components/mobile-shell";

export default function ActivityPage() {
  return (
    <MobileShell title="Activity">
      <ActivityFeedClient />
    </MobileShell>
  );
}
