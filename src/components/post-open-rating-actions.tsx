"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { appConfig } from "@/lib/app-config";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export function PostOpenRatingActions({
  postId,
  ownerId,
}: {
  postId: string;
  ownerId?: string | null;
}) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [canRate, setCanRate] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        if (!user || !ownerId || user.id === ownerId) {
          if (active) {
            setCanRate(false);
            setLoading(false);
          }
          return;
        }

        const { data: existingVote, error: voteError } = await supabase
          .from("votes")
          .select("post_id")
          .eq("user_id", user.id)
          .eq("post_id", postId)
          .maybeSingle();

        if (voteError) {
          throw voteError;
        }

        if (!active) {
          return;
        }

        setCanRate(!existingVote);
      } catch (error) {
        if (!active) {
          return;
        }

        const errorMessage = error instanceof Error ? error.message : "Unable to load rating state.";
        setMessage(errorMessage);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [ownerId, postId, supabase]);

  async function handleVote(value: "yes" | "no") {
    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase.rpc("cast_vote", {
        target_post_id: postId,
        vote_value: value,
      });

      if (error) {
        throw error;
      }

      setCanRate(false);
      setMessage(`${value === "yes" ? appConfig.yesLabel : appConfig.noLabel} saved.`);
      router.refresh();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unable to save vote.";
      const friendlyMessage =
        errorMessage.toLowerCase().includes("cast_vote") || errorMessage.toLowerCase().includes("function")
          ? "Voting needs the SQL function in SUPABASE_RPC_CAST_VOTE.sql applied in Supabase before this safer flow can work."
          : errorMessage;
      setMessage(friendlyMessage);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return null;
  }

  if (!canRate && !message) {
    return null;
  }

  return (
    <div className="space-y-3">
      {canRate ? (
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => void handleVote("yes")}
            disabled={saving}
            className="rounded-[1.8rem] border border-white/28 bg-white/10 px-4 py-3 text-white shadow-[0_12px_32px_rgba(0,0,0,0.16)] backdrop-blur-md transition hover:bg-white/14 disabled:opacity-60"
          >
            <span className="block text-[1.15rem] font-semibold leading-none tracking-tight">{saving ? "Saving..." : appConfig.yesLabel}</span>
          </button>
          <button
            type="button"
            onClick={() => void handleVote("no")}
            disabled={saving}
            className="rounded-[1.8rem] border border-white/28 bg-white/10 px-4 py-3 text-white shadow-[0_12px_32px_rgba(0,0,0,0.16)] backdrop-blur-md transition hover:bg-white/14 disabled:opacity-60"
          >
            <span className="block text-[1.15rem] font-semibold leading-none tracking-tight">{saving ? "Saving..." : appConfig.noLabel}</span>
          </button>
        </div>
      ) : null}

      {message ? <p className="text-sm leading-6 text-white/80">{message}</p> : null}
    </div>
  );
}
