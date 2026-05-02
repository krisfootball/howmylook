import { AccessGateCard } from "@/components/access-gate-card";
import { HomeFeedClient } from "@/components/home-feed-client";
import { MobileShell } from "@/components/mobile-shell";

export default function FollowingPage() {
  return (
    <MobileShell
      title="Home"
      subtitle="Your main feed: people you follow first, with fresh public looks and creator search built in."
    >
      <AccessGateCard areaLabel="Home feed">
        <HomeFeedClient />
      </AccessGateCard>
    </MobileShell>
  );
}
