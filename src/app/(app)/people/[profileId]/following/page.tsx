import Link from "next/link";
import { MobileShell } from "@/components/mobile-shell";
import { ProfileFollowListClient } from "@/components/profile-follow-list-client";
import { supabase } from "@/lib/supabase";

type PublicFollowingPageProps = {
  params: Promise<{
    profileId: string;
  }>;
};

export default async function PublicFollowingPage({ params }: PublicFollowingPageProps) {
  const { profileId } = await params;

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name,username")
    .eq("id", profileId)
    .maybeSingle();

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
