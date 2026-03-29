"use client";

import { trackEvent } from "@/lib/analytics";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

const AUTH_TIMEOUT_MS = 15000;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useSearchParams();

  const nextPath = params.get("next") || "/community";

  const parseErrorMessage = (err: unknown, fallback: string) => {
    if (err instanceof Error && err.message) return err.message;
    if (typeof err === "string" && err) return err;
    return fallback;
  };

  const withTimeout = async <T,>(promise: Promise<T>, timeoutMs: number, message: string) => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error(message)), timeoutMs);
    });

    try {
      return await Promise.race([promise, timeoutPromise]);
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  };

  const parseApiError = async (response: Response, fallback: string) => {
    try {
      const payload = (await response.json()) as { error?: string; message?: string };
      return payload.error ?? payload.message ?? fallback;
    } catch {
      return fallback;
    }
  };

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setStatus("");

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.trim().length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    setLoading(true);
    setStatus("Submitting your sign-in request...");

    try {
      trackEvent("login_attempted");
      const normalizedEmail = email.trim().toLowerCase();
      const trimmedPassword = password.trim();
      const client = createClient();
      const { error: loginError } = await withTimeout(
        client.auth.signInWithPassword({ email: normalizedEmail, password: trimmedPassword }),
        AUTH_TIMEOUT_MS,
        "Sign-in request timed out. Please try again.",
      );
      if (loginError) {
        setError(loginError.message);
        setStatus("");
        return;
      }

      const syncResponse = await withTimeout(
        fetch("/api/auth/sync-profile", { method: "POST" }),
        AUTH_TIMEOUT_MS,
        "Profile sync timed out after sign in. Please try again.",
      );
      if (!syncResponse.ok) {
        const apiMessage = await parseApiError(syncResponse, "Profile sync failed after sign in.");
        setError(`Sign in was successful, but profile sync failed: ${apiMessage}`);
        setStatus("");
        return;
      }

      setStatus("Sign-in successful. Redirecting...");
      router.push(nextPath);
      router.refresh();
    } catch (err) {
      setError(parseErrorMessage(err, "Unable to sign in at the moment."));
      setStatus("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 items-center px-4 py-12">
      <form onSubmit={onSubmit} className={`w-full rounded-2xl border border-white/10 bg-[#111111] p-6 ${error ? "animate-shake" : ""}`}>
        <h1 className="font-heading text-3xl text-white">Sign In</h1>
        <p className="mt-2 text-sm text-zinc-400">Access your trading dashboard securely.</p>
        <p className="mt-2 rounded-md border border-[#00AAFF]/30 bg-[#0d1a24] p-2 text-xs text-[#9ddfff]">
          Use your registered email address and password.
        </p>

        <div className="mt-6 space-y-4">
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" className="w-full rounded-lg border border-white/20 bg-[#0f0f0f] px-3 py-2 text-sm text-white" required />
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" className="w-full rounded-lg border border-white/20 bg-[#0f0f0f] px-3 py-2 text-sm text-white" required />
        </div>

        <div className="mt-3 min-h-5" aria-live="polite">
          {error ? <p className="text-sm text-[#FF4444]">{error}</p> : null}
          {!error && status ? <p className="text-sm text-[#9ddfff]">{status}</p> : null}
        </div>
        <button type="submit" disabled={loading} className="mt-6 w-full rounded-lg bg-[#00AAFF] py-2 font-semibold text-black disabled:opacity-60">
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </main>
  );
}
