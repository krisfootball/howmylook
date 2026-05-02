"use client";

import { useMemo, useState } from "react";
import { DiscoverCreatorsClient } from "@/components/discover-creators-client";
import { FollowingFeedClient } from "@/components/following-feed-client";

export function HomeFeedClient() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [query, setQuery] = useState("");

  const trimmedQuery = query.trim().toLowerCase();

  const discoverHint = useMemo(() => {
    if (!trimmedQuery) {
      return null;
    }

    return `Showing creators matching “${trimmedQuery}” first.`;
  }, [trimmedQuery]);

  return (
    <div className="space-y-5">
      <section className="rounded-[1.6rem] border border-pink-100 bg-white p-4 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-pink-500">Search</p>
        <h2 className="mt-2 text-lg font-semibold tracking-tight text-slate-900">Find people and looks</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Search creators by name or username, then explore the main home feed below.
        </p>
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search @username or display name"
          className="mt-4 w-full rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
        />
        {discoverHint ? <p className="mt-2 text-xs text-pink-600">{discoverHint}</p> : null}
      </section>

      <DiscoverCreatorsClient
        query={trimmedQuery}
        onChanged={() => setRefreshKey((current) => current + 1)}
      />

      <FollowingFeedClient refreshKey={refreshKey} />
    </div>
  );
}
