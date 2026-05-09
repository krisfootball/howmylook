import Link from "next/link";
import { MobileShell } from "@/components/mobile-shell";
import { ProfileFollowListClient } from "@/components/profile-follow-list-client";

type PublicFollowingPageProps = {
  params: Promise<{
    profileId: string;
  }>;
};

export default async function PublicFollowingPage({ params }: PublicFollowingPageProps) {
  const { profileId } = await params;

  return (
    <MobileShell title="Following" hideHeader>
      <div className="space-y-4">
        <Link href={`/people/${profileId}`} className="inline-flex rounded-full bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm">
          ← Back
        </Link>

        <ProfileFollowListClient mode="following" profileId={profileId} />
      </div>
    </MobileShell>
  );
}
