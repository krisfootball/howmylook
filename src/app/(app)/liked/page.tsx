import { AccessGateCard } from "@/components/access-gate-card";
import { MobileShell } from "@/components/mobile-shell";
import { VoteHistoryClient } from "@/components/vote-history-client";

export default function LikedPage() {
  return (
    <MobileShell
      title="Yes history"
      subtitle="These are the looks you voted yes on. This stays visible only to you."
    >
      <AccessGateCard areaLabel="Yes history">
        <VoteHistoryClient value="yes" />
      </AccessGateCard>
    </MobileShell>
  );
}
