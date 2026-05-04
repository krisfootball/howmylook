import { AccessGateCard } from "@/components/access-gate-card";
import { HomeFeedClient } from "@/components/home-feed-client";
import { MobileShell } from "@/components/mobile-shell";

export default function HomePage() {
  return (
    <MobileShell title="Home" hideHeader>
      <AccessGateCard areaLabel="Home feed">
        <HomeFeedClient />
      </AccessGateCard>
    </MobileShell>
  );
}
