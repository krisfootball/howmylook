import { AccessGateCard } from "@/components/access-gate-card";
import { FollowingFeedClient } from "@/components/following-feed-client";
import { MobileShell } from "@/components/mobile-shell";

export default function HomePage() {
  return (
    <MobileShell title="Home" hideHeader>
      <AccessGateCard areaLabel="Home feed" bare>
        <FollowingFeedClient />
      </AccessGateCard>
    </MobileShell>
  );
}
