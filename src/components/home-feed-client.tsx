"use client";

import { useMemo, useState } from "react";
import { DiscoverCreatorsClient } from "@/components/discover-creators-client";
import { FollowingFeedClient } from "@/components/following-feed-client";

export function HomeFeedClient() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

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
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-pink-500">Search</p>
            <h2 className="mt-2 text-lg font-semibold tracking-tight text-slate-900">Find people and looks</h2>
          </div>
          <button
            type="button"
            onClick={() => setSearchOpen((current) => !current)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm"
          >
            <span className="text-base leading-none">⌕</span>
            <span>{searchOpen ? "Close" : "Search"}</span>
          </button>
        </div>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Search creators by name or username, then explore the main home feed below.
        </p>

        {searchOpen ? (
          <div className="mt-4 rounded-[1.4rem] border border-slate-200 bg-slate-50 p-3">
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Search creators</label>
            <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-3">
              <span className="text-sm text-slate-400">⌕</span>
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="@username or display name"
                className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="text-xs font-semibold text-slate-500"
                >
                  Clear
                </button>
              ) : null}
            </div>
            {discoverHint ? <p className="mt-2 text-xs text-pink-600">{discoverHint}</p> : null}
          </div>
        ) : null}
      </section>

      <DiscoverCreatorsClient
        query={trimmedQuery}
        onChanged={() => setRefreshKey((current) => current + 1)}
      />

      <FollowingFeedClient refreshKey={refreshKey} />
    </div>
  );
}
