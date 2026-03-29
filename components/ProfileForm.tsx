"use client";

import { trackEvent } from "@/lib/analytics";
import { useState } from "react";

type ProfileFormProps = {
  initialFullName: string;
  initialPhone: string;
};

export function ProfileForm({ initialFullName, initialPhone }: ProfileFormProps) {
  const [fullName, setFullName] = useState(initialFullName);
  const [phone, setPhone] = useState(initialPhone);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const onSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, phone }),
      });

      const data = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !data.ok) {
        setError(data.error ?? "Failed to update your profile.");
        setSaving(false);
        return;
      }

      trackEvent("profile_updated");
      setMessage("Profile updated successfully.");
    } catch {
      setError("Unable to update your profile right now. Please try again.");
    }

    setSaving(false);
  };

  return (
    <form onSubmit={onSave} className="mt-6 rounded-xl border border-white/10 bg-[#111111] p-5">
      <div className="grid gap-3">
        <input
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          placeholder="Full name"
          className="rounded-lg border border-white/20 bg-[#0f0f0f] px-3 py-2 text-sm text-white"
          required
        />
        <input
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="Phone number"
          className="rounded-lg border border-white/20 bg-[#0f0f0f] px-3 py-2 text-sm text-white"
          required
        />
      </div>

      {error ? <p className="mt-3 text-sm text-[#FF4444]">{error}</p> : null}
      {message ? <p className="mt-3 text-sm text-[#00FF7F]">{message}</p> : null}

      <button disabled={saving} className="mt-4 rounded bg-[#00AAFF] px-4 py-2 font-semibold text-black disabled:opacity-60">
        {saving ? "Saving..." : "Save Profile"}
      </button>
    </form>
  );
}
