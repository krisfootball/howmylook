import Link from "next/link";
import { AccessGateCard } from "@/components/access-gate-card";
import { MobileShell } from "@/components/mobile-shell";
import { VoteHistoryClient } from "@/components/vote-history-client";

export default function DislikedPage() {
  return (
    <MobileShell title="No given" hideHeader>
      <div className="space-y-4">
        <Link href="/profile" className="inline-flex rounded-full bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm">
          ← Back
        </Link>

        <AccessGateCard areaLabel="No given">
          <VoteHistoryClient value="no" />
        </AccessGateCard>
      </div>
    </MobileShell>
  );
}
