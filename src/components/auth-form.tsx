"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { appConfig } from "@/lib/app-config";
import { getNextRequiredStep, hasCompletedUsername } from "@/lib/app-state";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

type AuthMode = "signin" | "signup";
type MessageTone = "neutral" | "success" | "error";

export function AuthForm() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<MessageTone>("neutral");
  const [loading, setLoading] = useState(false);
  const [acceptedPolicies, setAcceptedPolicies] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setMessageTone("neutral");

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

        const needsEmailConfirmation = !signUpData.session;

        if (signUpData.user && !needsEmailConfirmation) {
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

        setMessage(
          needsEmailConfirmation
            ? "Check your email\nWe sent you a confirmation link. Confirm your signup, then come back and sign in."
            : "Account created. You can now continue into the app.",
        );
        setMessageTone(needsEmailConfirmation ? "success" : "neutral");

        if (needsEmailConfirmation) {
          setMode("signin");
          return;
        }

        router.replace("/welcome");
        router.refresh();
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          throw error;
        }

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        if (!user) {
          throw new Error("Signed in, but the user session could not be loaded.");
        }

        const { error: resetSessionGateError } = await supabase
          .from("profiles")
          .update({ login_rating_votes_completed: 0 })
          .eq("id", user.id);

        if (resetSessionGateError) {
          throw resetSessionGateError;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("username,login_rating_votes_completed")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) {
          throw profileError;
        }

        const ratingsCompleted = profile?.login_rating_votes_completed ?? 0;

        const nextStep = getNextRequiredStep({
          isAuthenticated: true,
          hasUsername: hasCompletedUsername({
            id: user.id,
            username: profile?.username,
          }),
          ratingsCompleted,
          unlockVoteCount: appConfig.unlockVoteCount,
        });

        const nextPath =
          nextStep === "username"
            ? "/welcome"
            : nextStep === "rating"
              ? "/rate"
              : "/home";

        setMessage(
          nextStep === "username"
            ? "Signed in. Next step: choose your username."
            : nextStep === "rating"
              ? "Signed in. Continue rating to unlock the app."
              : "Signed in. Welcome back."
        );
        setMessageTone("neutral");
        router.replace(nextPath);
        router.refresh();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Something went wrong.";
      setMessage(errorMessage);
      setMessageTone("error");
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

      <form onSubmit={handleSubmit} className="space-y-3 rounded-[1.7rem] border border-pink-100 bg-pink-50/70 p-4 shadow-sm">
        {mode === "signup" ? (
          <label className="flex items-start gap-3 rounded-[1.2rem] bg-white px-3 py-3 text-xs leading-5 text-slate-600 shadow-sm">
            <input
              type="checkbox"
              checked={acceptedPolicies}
              onChange={(event) => setAcceptedPolicies(event.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-900"
              required
            />
            <span>
              I agree to the <Link href="/terms" className="font-semibold text-slate-900 underline">Terms</Link>, <Link href="/privacy" className="font-semibold text-slate-900 underline">Privacy Policy</Link>, and <Link href="/guidelines" className="font-semibold text-slate-900 underline">Community Guidelines</Link>.
            </span>
          </label>
        ) : null}
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
          className="w-full rounded-full bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(15,23,42,0.18)] disabled:opacity-60"
        >
          {loading ? "Please wait..." : mode === "signup" ? "Continue with email" : "Sign in"}
        </button>
      </form>

      {message ? (
        messageTone === "success" ? (
          <div className="rounded-[1.4rem] border border-emerald-100 bg-emerald-50 px-4 py-4 text-sm leading-6 text-emerald-900 shadow-sm">
            <p className="text-base font-semibold tracking-tight">Check your email</p>
            <p className="mt-2 text-sm leading-6 text-emerald-900/80">We sent you a confirmation link. Confirm your signup, then come back and sign in.</p>
          </div>
        ) : (
          <div className={`rounded-[1.2rem] px-4 py-3 text-sm leading-6 shadow-sm ${
            messageTone === "error"
              ? "bg-rose-50 text-rose-700"
              : "bg-white text-slate-600"
          }`}>
            {message}
          </div>
        )
      ) : null}

      <p className="text-xs leading-5 text-slate-500">
        Need the legal docs? <Link href="/terms" className="underline">Terms</Link> · <Link href="/privacy" className="underline">Privacy</Link> · <Link href="/guidelines" className="underline">Guidelines</Link> · <Link href="/contact" className="underline">Contact</Link>
      </p>
    </div>
  );
}
