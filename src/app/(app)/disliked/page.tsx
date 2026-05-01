import { AccessGateCard } from "@/components/access-gate-card";
import { MobileShell } from "@/components/mobile-shell";
import { VoteHistoryClient } from "@/components/vote-history-client";

export default function DislikedPage() {
  return (
    <MobileShell
      title="No given"
      subtitle="These are the looks you voted no on. It helps you see the styles and outfit patterns you usually pass on."
    >
      <AccessGateCard areaLabel="No given">
        <VoteHistoryClient value="no" />
      </AccessGateCard>
    </MobileShell>
  );
}
