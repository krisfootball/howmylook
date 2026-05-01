import Link from "next/link";
import { MobileShell } from "@/components/mobile-shell";
import { ProfileFollowListClient } from "@/components/profile-follow-list-client";
import { supabase } from "@/lib/supabase";

type PublicFollowersPageProps = {
  params: Promise<{
    profileId: string;
  }>;
};

export default async function PublicFollowersPage({ params }: PublicFollowersPageProps) {
  const { profileId } = await params;

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name,username")
    .eq("id", profileId)
    .maybeSingle();

  const name = profile?.display_name || profile?.username || "This account";

  return (
    <MobileShell title="Followers" subtitle={`People following ${name}.`}>
      <div className="space-y-4">
        <Link href={`/people/${profileId}`} className="inline-flex rounded-full bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm">
          ← Back to profile
        </Link>

        <ProfileFollowListClient mode="followers" profileId={profileId} />
      </div>
    </MobileShell>
  );
}
