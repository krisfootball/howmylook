import { AccessGateCard } from "@/components/access-gate-card";
import { MobileShell } from "@/components/mobile-shell";
import { VoteHistoryClient } from "@/components/vote-history-client";

export default function LikedPage() {
  return (
    <MobileShell title="Yes given" hideHeader>
      <AccessGateCard areaLabel="Yes given">
        <VoteHistoryClient value="yes" />
      </AccessGateCard>
    </MobileShell>
  );
}
