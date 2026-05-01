"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { hasCompletedUsername } from "@/lib/app-state";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export function UsernameForm() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    async function loadExistingProfile() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        if (!user) {
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("username,display_name")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) {
          throw profileError;
        }

        const savedUsername = hasCompletedUsername({ id: user.id, username: profile?.username })
          ? profile?.username ?? ""
          : "";

        setUsername(savedUsername);
        setDisplayName(profile?.display_name ?? "");
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unable to load your current profile.";
        setMessage(errorMessage);
      } finally {
        setInitializing(false);
      }
    }

    loadExistingProfile();
  }, [supabase]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        throw new Error("You need to sign in before choosing a username.");
      }

      const cleanUsername = username.trim().toLowerCase();

      const { data: existingUsername, error: existingUsernameError } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", cleanUsername)
        .neq("id", user.id)
        .maybeSingle();

      if (existingUsernameError) {
        throw existingUsernameError;
      }

      if (existingUsername) {
        throw new Error("That username is already taken.");
      }

      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        username: cleanUsername,
        display_name: displayName.trim() || null,
      });

      if (error) {
        throw error;
      }

      setMessage("Profile saved. Next step: rate 5 looks to unlock the app.");
      router.replace("/rate");
      router.refresh();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Something went wrong.";
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <section className="space-y-3 rounded-[1.5rem] border border-pink-100 bg-pink-50/70 p-4">
        <div>
          <label className="text-sm font-semibold text-slate-900">Username</label>
          <input
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="yourstyle"
            className="mt-2 w-full rounded-xl bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none ring-0"
            required
            minLength={3}
            disabled={initializing || loading}
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-900">Display name</label>
          <input
            type="text"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="Sofia"
            className="mt-2 w-full rounded-xl bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none ring-0"
            disabled={initializing || loading}
          />
        </div>

        <button
          type="submit"
          disabled={initializing || loading}
          className="w-full rounded-full bg-pink-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/20 disabled:opacity-60"
        >
          {initializing ? "Loading..." : loading ? "Saving..." : username ? "Save profile" : "Save username"}
        </button>
      </section>

      {message ? (
        <div className="rounded-[1.2rem] bg-white px-4 py-3 text-sm leading-6 text-slate-600 shadow-sm">
          {message}
        </div>
      ) : null}
    </form>
  );
}
