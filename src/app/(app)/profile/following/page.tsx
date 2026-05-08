import Link from "next/link";
import { MobileShell } from "@/components/mobile-shell";
import { ProfileFollowListClient } from "@/components/profile-follow-list-client";

export default function FollowingListPage() {
  return (
    <MobileShell title="Following" hideHeader>
      <div className="space-y-4">
        <Link href="/profile" className="inline-flex rounded-full bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm">
          ← Back
        </Link>

        <ProfileFollowListClient mode="following" />
      </div>
    </MobileShell>
  );
}
