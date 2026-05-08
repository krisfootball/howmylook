import { AccessGateCard } from "@/components/access-gate-card";
import { MobileShell } from "@/components/mobile-shell";
import { VoteHistoryClient } from "@/components/vote-history-client";

export default function DislikedPage() {
  return (
    <MobileShell title="No given" hideHeader>
      <AccessGateCard areaLabel="No given">
        <VoteHistoryClient value="no" />
      </AccessGateCard>
    </MobileShell>
  );
}
