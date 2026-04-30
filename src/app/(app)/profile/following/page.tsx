import Link from "next/link";
import { MobileShell } from "@/components/mobile-shell";
import { supabase } from "@/lib/supabase";

type FollowingListPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function FollowingListPage(_props: FollowingListPageProps) {
  const { data: follows, error } = await supabase
    .from("follows")
    .select("follower_id,following_id,created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  const followingIds = Array.from(new Set((follows ?? []).map((row) => row.following_id)));

  const { data: profiles } = followingIds.length
    ? await supabase
        .from("profiles")
        .select("id,username,display_name,bio")
        .in("id", followingIds)
    : { data: [] as Array<{ id: string; username: string | null; display_name: string | null; bio: string | null }> };

  const profileMap = new Map((profiles ?? []).map((profile) => [profile.id, profile]));

  const people = followingIds
    .map((id) => profileMap.get(id))
    .filter(Boolean)
    .map((profile) => ({
      id: profile!.id,
      displayName: profile!.display_name || "HowMyLook user",
      username: profile!.username ? `@${profile!.username}` : "@username",
      bio: profile!.bio || "Posting looks and getting quick feedback.",
    }));

  return (
    <MobileShell title="Following" subtitle="People you follow.">
      <div className="space-y-4">
        <Link href="/profile" className="inline-flex rounded-full bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm">
          ← Back to profile
        </Link>

        {error ? (
          <section className="rounded-[1.6rem] border border-rose-100 bg-rose-50 p-5 text-sm leading-6 text-rose-700 shadow-sm">
            Unable to load following right now.
          </section>
        ) : people.length === 0 ? (
          <section className="rounded-[1.6rem] border border-pink-100 bg-white p-5 text-sm text-slate-600 shadow-sm">
            You are not following anyone yet.
          </section>
        ) : (
          <div className="space-y-3">
            {people.map((person) => (
              <Link
                key={person.id}
                href={`/people/${person.id}`}
                className="block rounded-[1.4rem] border border-pink-100 bg-white px-4 py-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <p className="font-semibold text-slate-900">{person.displayName}</p>
                <p className="text-sm text-slate-500">{person.username}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{person.bio}</p>
                <p className="mt-2 text-xs font-medium text-pink-600">Open profile</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </MobileShell>
  );
}
