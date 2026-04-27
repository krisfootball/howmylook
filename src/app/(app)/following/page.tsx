import { AccessGateCard } from "@/components/access-gate-card";
import { FollowingPageClient } from "@/components/following-page-client";
import { MobileShell } from "@/components/mobile-shell";

export default function FollowingPage() {
  return (
    <MobileShell
      title="Following"
      subtitle="Photos from people you follow. This is separate from the fairness-focused rating queue."
    >
      <AccessGateCard areaLabel="Following feed">
        <FollowingPageClient />
      </AccessGateCard>
    </MobileShell>
  );
}
