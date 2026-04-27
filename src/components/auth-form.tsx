"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

type AuthMode = "signin" | "signup";

export function AuthForm() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (mode === "signup") {
        const {
          data: signUpData,
          error,
        } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          throw error;
        }

        if (signUpData.user) {
          const fallbackUsername = `user_${signUpData.user.id.slice(0, 8)}`;
          const { error: profileError } = await supabase.from("profiles").upsert({
            id: signUpData.user.id,
            username: fallbackUsername,
            display_name: null,
          });

          if (profileError) {
            throw profileError;
          }
        }

        setMessage("Account created. Check your email if Supabase asks for confirmation, then sign in.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          throw error;
        }

        setMessage("Signed in. Next step: choose your username.");
        router.replace("/welcome");
        router.refresh();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Something went wrong.";
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 rounded-full bg-pink-50 p-1">
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            mode === "signup" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
          }`}
        >
          Create account
        </button>
        <button
          type="button"
          onClick={() => setMode("signin")}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            mode === "signin" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
          }`}
        >
          Sign in
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 rounded-[1.5rem] border border-pink-100 bg-pink-50/70 p-4">
        <div>
          <label className="text-sm font-semibold text-slate-900">Email</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="mt-2 w-full rounded-xl bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none ring-0"
            required
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-900">Password</label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 6 characters"
            className="mt-2 w-full rounded-xl bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none ring-0"
            required
            minLength={6}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Please wait..." : mode === "signup" ? "Continue with email" : "Sign in"}
        </button>
      </form>

      {message ? (
        <div className="rounded-[1.2rem] bg-white px-4 py-3 text-sm leading-6 text-slate-600 shadow-sm">
          {message}
        </div>
      ) : null}
    </div>
  );
}
