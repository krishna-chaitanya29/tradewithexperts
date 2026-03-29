"use client";

import { trackEvent } from "@/lib/analytics";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

const AUTH_TIMEOUT_MS = 15000;

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState("");
  const router = useRouter();

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
  const normalizePhone = (value: string) => value.replace(/\D/g, "");

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setInfo("");
    setStatus("");

    if (fullName.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.trim().length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    const normalizedPhone = normalizePhone(phone);
    if (normalizedPhone.length < 8 || normalizedPhone.length > 15) {
      setError("Please enter a valid phone number.");
      return;
    }

    setLoading(true);
    setStatus("Submitting your registration request...");

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const trimmedPassword = password.trim();
      const trimmedName = fullName.trim();
      const trimmedPhone = phone.trim();

      const checkResponse = await withTimeout(
        fetch("/api/auth/validate-registration", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: normalizedEmail, phone: trimmedPhone }),
        }),
        AUTH_TIMEOUT_MS,
        "Registration check timed out. Please try again.",
      );

      if (!checkResponse.ok) {
        const validationMessage = await parseApiError(checkResponse, "Registration validation failed.");
        setError(validationMessage);
        setStatus("");
        return;
      }

      const registerResponse = await withTimeout(
        fetch("/api/auth/register-direct", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: normalizedEmail,
            password: trimmedPassword,
            fullName: trimmedName,
            phone: trimmedPhone,
          }),
        }),
        AUTH_TIMEOUT_MS,
        "Registration request timed out. Please try again.",
      );

      if (!registerResponse.ok) {
        const registerMessage = await parseApiError(registerResponse, "Registration failed.");
        setError(registerMessage);
        setStatus("");
        return;
      }

      const client = createClient();
      const { error: loginError } = await withTimeout(
        client.auth.signInWithPassword({ email: normalizedEmail, password: trimmedPassword }),
        AUTH_TIMEOUT_MS,
        "Auto sign-in timed out after registration. Please sign in manually.",
      );

      if (loginError) {
        setStatus("");
        setInfo("Account created successfully. Please sign in with your email and password.");
        return;
      }

      const syncResponse = await withTimeout(
        fetch("/api/auth/sync-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fullName: trimmedName, phone: trimmedPhone }),
        }),
        AUTH_TIMEOUT_MS,
        "Profile sync timed out. Please try again.",
      );

      if (!syncResponse.ok) {
        const syncMessage = await parseApiError(syncResponse, "Failed to save profile.");
        setError(syncMessage);
        setStatus("");
        return;
      }

      trackEvent("register_completed");
      setStatus("Registration successful. Redirecting...");
      router.push("/community");
      router.refresh();
    } catch (err) {
      setError(parseErrorMessage(err, "Unable to complete registration at the moment."));
      setStatus("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 items-center px-4 py-12">
      <form onSubmit={onSubmit} className={`w-full rounded-2xl border border-white/10 bg-[#111111] p-6 ${error ? "animate-shake" : ""}`}>
        <h1 className="font-heading text-3xl text-white">Create Account</h1>
        <p className="mt-2 text-sm text-zinc-400">Create your account to unlock community access links.</p>
        <p className="mt-2 rounded-md border border-[#00AAFF]/30 bg-[#0d1a24] p-2 text-xs text-[#9ddfff]">
          Enter valid details to register instantly and access your account.
        </p>

        <div className="mt-6 space-y-4">
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} type="text" placeholder="Full Name" className="w-full rounded-lg border border-white/20 bg-[#0f0f0f] px-3 py-2 text-sm text-white" required />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" placeholder="Phone number" className="w-full rounded-lg border border-white/20 bg-[#0f0f0f] px-3 py-2 text-sm text-white" required />
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" className="w-full rounded-lg border border-white/20 bg-[#0f0f0f] px-3 py-2 text-sm text-white" required />
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" minLength={6} placeholder="Password" className="w-full rounded-lg border border-white/20 bg-[#0f0f0f] px-3 py-2 text-sm text-white" required />
        </div>

        <div className="mt-3 min-h-5" aria-live="polite">
          {error ? <p className="text-sm text-[#FF4444]">{error}</p> : null}
          {!error && info ? <p className="text-sm text-[#00FF7F]">{info}</p> : null}
          {!error && !info && status ? <p className="text-sm text-[#9ddfff]">{status}</p> : null}
        </div>

        <button type="submit" disabled={loading} className="mt-6 w-full rounded-lg bg-[#FFD700] py-2 font-semibold text-black disabled:opacity-60">
          {loading ? "Creating account..." : "Create Account"}
        </button>

        <p className="mt-4 text-sm text-zinc-400">
          Already have an account? <Link href="/login" className="text-[#00AAFF]">Sign In</Link>
        </p>
      </form>
    </main>
  );
}
