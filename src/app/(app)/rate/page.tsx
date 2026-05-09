import { AccessGateCard } from "@/components/access-gate-card";
import { MobileShell } from "@/components/mobile-shell";
import { RateLookClient } from "@/components/rate-look-client";

export default function RatePage() {
  return (
    <MobileShell title="Home" hideHeader>
      <AccessGateCard areaLabel="Rating feed" bare>
        <RateLookClient initialRatingsCompleted={0} />
      </AccessGateCard>
    </MobileShell>
  );
}
