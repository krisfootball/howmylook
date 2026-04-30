import { AccessGateCard } from "@/components/access-gate-card";
import { FollowingPageClient } from "@/components/following-page-client";
import { MobileShell } from "@/components/mobile-shell";

export default function FollowingPage() {
  return (
    <MobileShell
      title="Following"
      subtitle="Posts from people you follow first, with fresh public looks added when your feed needs more."
    >
      <AccessGateCard areaLabel="Following feed">
        <FollowingPageClient />
      </AccessGateCard>
    </MobileShell>
  );
}
