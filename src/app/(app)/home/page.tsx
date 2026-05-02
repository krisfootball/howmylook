import { AccessGateCard } from "@/components/access-gate-card";
import { HomeFeedClient } from "@/components/home-feed-client";
import { MobileShell } from "@/components/mobile-shell";

export default function HomePage() {
  return (
    <MobileShell
      title="Home"
      subtitle="Your main feed: rate one look at a time and move instantly to the next."
    >
      <AccessGateCard areaLabel="Home feed">
        <HomeFeedClient />
      </AccessGateCard>
    </MobileShell>
  );
}
