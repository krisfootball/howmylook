import { AccessGateCard } from "@/components/access-gate-card";
import { MobileShell } from "@/components/mobile-shell";
import { VoteHistoryClient } from "@/components/vote-history-client";

export default function LikedPage() {
  return (
    <MobileShell
      title="Yes given"
      subtitle="These are the looks you voted yes on. It helps you see the style and outfits you naturally lean toward."
    >
      <AccessGateCard areaLabel="Yes given">
        <VoteHistoryClient value="yes" />
      </AccessGateCard>
    </MobileShell>
  );
}
