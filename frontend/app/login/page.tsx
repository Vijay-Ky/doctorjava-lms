"use client";

import { FormEvent, Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Mail, Lock, LogIn } from "lucide-react";
import PageShell from "@/components/lms/PageShell";
import { login, isInstructorOnly, hasAdminAccess } from "@/lib/lms/api";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

function LoginPageContent() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (searchParams.get("registered") === "1") {
      setInfo("Account created successfully. Please sign in.");
    }
    const err = searchParams.get("error");
    if (err === "oauth_no_email") {
      setError("Social login failed: email permission is required.");
    } else if (err) {
      setError("Social login failed. Try again or use email/password.");
    }
    const next = searchParams.get("next");
    if (next === "/admin" || (next && next.startsWith("/admin"))) {
      setInfo("Admin panel: sign in with admin@doctorjava.tech / admin");
    } else if (next) {
      setInfo("Please sign in to continue.");
    }
  }, [searchParams]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login(email, password);
      let next = searchParams.get("next") || "/dashboard";
      const role =
        typeof window !== "undefined" ? localStorage.getItem("role") : null;
      if (!searchParams.get("next")) {
        if (hasAdminAccess(role)) next = "/admin";
        else if (isInstructorOnly(role)) next = "/instructor";
        else next = "/dashboard";
      }
      location.href = next;
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setBusy(false);
    }
  }

  function socialLogin(provider: "google" | "facebook") {
    // Spring Security OAuth2 authorization endpoint
    window.location.href = `${API_BASE}/oauth2/authorization/${provider}`;
  }

  return (
    <PageShell>
      <main className="mx-auto flex max-w-6xl items-center justify-center px-5 py-16">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple text-white">
              <LogIn />
            </div>
            <h1 className="font-display text-3xl font-bold">Welcome back</h1>
            <p className="mt-2 text-sm text-slate-500">
              Sign in to access practice tests and your dashboard.
            </p>
          </div>

          <div className="space-y-5 rounded-3xl border border-slate-200 bg-white p-7 shadow-soft">
            {info && (
              <div className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">
                {info}
              </div>
            )}

            <div className="grid gap-2">
              <button
                type="button"
                onClick={() => socialLogin("google")}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-3 text-sm font-bold text-ink hover:bg-slate-50"
              >
                <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
                  <path
                    fill="#FFC107"
                    d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.2 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.5-.4-3.5z"
                  />
                  <path
                    fill="#FF3D00"
                    d="M6.3 14.7l6.6 4.8C14.7 16.1 19 13 24 13c3.1 0 5.8 1.1 8 3l5.7-5.7C34.2 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
                  />
                  <path
                    fill="#4CAF50"
                    d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.3 26.8 36 24 36c-5.3 0-9.7-3.3-11.3-7.9l-6.5 5C9.6 39.6 16.3 44 24 44z"
                  />
                  <path
                    fill="#1976D2"
                    d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.2-3.5 5.7-6.5 7.1l.1.1 6.2 5.2C36.9 39.2 44 34 44 24c0-1.3-.1-2.5-.4-3.5z"
                  />
                </svg>
                Continue with Google
              </button>
              <button
                type="button"
                onClick={() => socialLogin("facebook")}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-[#1877F2] py-3 text-sm font-bold text-white hover:bg-[#166fe5]"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.79-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.89v2.26h3.32l-.53 3.49h-2.79V24C19.61 23.09 24 18.1 24 12.07z" />
                </svg>
                Continue with Facebook
              </button>
            </div>

            <div className="relative py-1 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">
              <span className="relative z-10 bg-white px-3">or email</span>
              <span className="absolute left-0 right-0 top-1/2 h-px bg-slate-200" />
            </div>

            <form onSubmit={submit} className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold">Email</span>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3">
                  <Mail size={17} className="text-slate-400" />
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full py-3 outline-none"
                    placeholder="you@example.com"
                  />
                </div>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold">
                  Password
                </span>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3">
                  <Lock size={17} className="text-slate-400" />
                  <input
                    required
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full py-3 outline-none"
                    placeholder="Your password"
                  />
                </div>
              </label>
              {error && (
                <div className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">
                  {error}
                </div>
              )}
              <button
                disabled={busy}
                className="w-full rounded-xl bg-ink py-3.5 font-bold text-white hover:bg-purple disabled:opacity-50"
              >
                {busy ? "Signing in…" : "Sign in"}
              </button>
            </form>

            <p className="text-center text-sm text-slate-500">
              New here?{" "}
              <Link className="font-semibold text-purple" href="/register">
                Create an account
              </Link>
            </p>
            <p className="text-center text-[11px] text-slate-400">
              Social login requires{" "}
              <code className="rounded bg-slate-100 px-1">
                GOOGLE_CLIENT_ID
              </code>{" "}
              /{" "}
              <code className="rounded bg-slate-100 px-1">
                FACEBOOK_CLIENT_ID
              </code>{" "}
              and profile{" "}
              <code className="rounded bg-slate-100 px-1">oauth</code>. See
              application-oauth.yml.
            </p>
          </div>
        </div>
      </main>
    </PageShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <PageShell>
          <main className="mx-auto flex max-w-6xl items-center justify-center px-5 py-16">
            <p className="text-slate-500">Loading…</p>
          </main>
        </PageShell>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
