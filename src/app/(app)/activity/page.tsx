import Link from "next/link";
import { ActivityFeedClient } from "@/components/activity-feed-client";
import { MobileShell } from "@/components/mobile-shell";

export default function ActivityPage() {
  return (
    <MobileShell title="Activity">
      <div className="space-y-4">
        <Link href="/profile" className="inline-flex rounded-full bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm">
          ← Back to profile
        </Link>

        <ActivityFeedClient />
      </div>
    </MobileShell>
  );
}
