"use client";

import Link from "next/link";
import { useState } from "react";

type CommunityJoinCtaProps = {
  isAuthenticated: boolean;
};

export function CommunityJoinCta({ isAuthenticated }: CommunityJoinCtaProps) {
  const [open, setOpen] = useState(false);

  if (isAuthenticated) {
    return (
      <Link href="/community/links" className="inline-flex rounded-full bg-[#00AAFF] px-6 py-3 font-semibold text-black transition hover:bg-[#36bbff]">
        Join Free Community
      </Link>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex rounded-full bg-[#FFD700] px-6 py-3 font-semibold text-black transition hover:bg-[#ffe34d]"
      >
        Join Free Community
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111111] p-6">
            <h3 className="font-heading text-2xl text-white">Login Required</h3>
            <p className="mt-2 text-sm text-zinc-300">Please login or register first to access the Telegram and WhatsApp links.</p>
            <div className="mt-5 flex gap-3">
              <Link href="/login?next=/community/links" className="rounded-lg bg-[#00AAFF] px-4 py-2 font-semibold text-black">
                Login
              </Link>
              <Link href="/register" className="rounded-lg bg-[#FFD700] px-4 py-2 font-semibold text-black">
                Register
              </Link>
              <button type="button" onClick={() => setOpen(false)} className="ml-auto rounded-lg border border-white/20 px-4 py-2 text-zinc-300">
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
