import { AccessGateCard } from "@/components/access-gate-card";
import { MobileShell } from "@/components/mobile-shell";
import { VoteHistoryClient } from "@/components/vote-history-client";

export default function DislikedPage() {
  return (
    <MobileShell
      title="No history"
      subtitle="These are the looks you voted no on. This stays visible only to you."
    >
      <AccessGateCard areaLabel="No history">
        <VoteHistoryClient value="no" />
      </AccessGateCard>
    </MobileShell>
  );
}
