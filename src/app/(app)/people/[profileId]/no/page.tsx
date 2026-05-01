import Link from "next/link";
import { MobileShell } from "@/components/mobile-shell";
import { PublicVoteHistoryList } from "@/components/public-vote-history-list";
import { supabase } from "@/lib/supabase";

type PublicNoPageProps = {
  params: Promise<{
    profileId: string;
  }>;
};

export default async function PublicNoPage({ params }: PublicNoPageProps) {
  const { profileId } = await params;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id,username,display_name")
    .eq("id", profileId)
    .maybeSingle();

  if (profileError || !profile) {
    return (
      <MobileShell title="No given" subtitle="This profile could not be opened.">
        <section className="rounded-[1.6rem] border border-rose-100 bg-rose-50 p-5 text-sm leading-6 text-rose-700 shadow-sm">
          This profile is unavailable right now.
        </section>
        <Link href="/following" className="mt-4 inline-flex rounded-full bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm">
          Back to following
        </Link>
      </MobileShell>
    );
  }

  const { data: votes, error: votesError } = await supabase
    .from("votes")
    .select("post_id")
    .eq("user_id", profileId)
    .eq("value", "no");

  if (votesError) {
    return (
      <MobileShell title="No given" subtitle="This profile’s style history could not be loaded.">
        <section className="rounded-[1.6rem] border border-rose-100 bg-rose-50 p-5 text-sm leading-6 text-rose-700 shadow-sm">
          Unable to load this account’s no votes right now.
        </section>
      </MobileShell>
    );
  }

  const postIds = (votes ?? []).map((vote) => vote.post_id);
  let items: { id: string; caption: string; imageUrl: string; yesCount: number; noCount: number }[] = [];

  if (postIds.length > 0) {
    const { data: posts, error: postsError } = await supabase
      .from("posts")
      .select("id,caption,image_url,yes_count,no_count")
      .in("id", postIds)
      .eq("is_active", true);

    if (postsError) {
      return (
        <MobileShell title="No given" subtitle="This profile’s style history could not be loaded.">
          <section className="rounded-[1.6rem] border border-rose-100 bg-rose-50 p-5 text-sm leading-6 text-rose-700 shadow-sm">
            Unable to load the voted posts right now.
          </section>
        </MobileShell>
      );
    }

    items = postIds
      .map((postId) => (posts ?? []).find((post) => post.id === postId))
      .filter((post): post is NonNullable<typeof post> => Boolean(post))
      .map((post) => ({
        id: post.id,
        caption: post.caption ?? "Would you wear this?",
        imageUrl: post.image_url,
        yesCount: post.yes_count,
        noCount: post.no_count,
      }));
  }

  const name = profile.display_name || profile.username || "This account";

  return (
    <MobileShell
      title="No given"
      subtitle={`${name}’s public no votes. This helps people see the styles and outfit patterns they usually reject.`}
    >
      <div className="space-y-4">
        <Link href={`/people/${profileId}`} className="inline-flex rounded-full bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm">
          ← Back to profile
        </Link>

        <PublicVoteHistoryList items={items} value="no" profileId={profileId} />
      </div>
    </MobileShell>
  );
}
