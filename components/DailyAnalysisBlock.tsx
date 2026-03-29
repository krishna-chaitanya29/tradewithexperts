"use client";

import { trackEvent } from "@/lib/analytics";
import type { DailyAnalysis } from "@/lib/types";
import { useEffect } from "react";

type DailyAnalysisBlockProps = {
  analysis: DailyAnalysis | null;
};

export function DailyAnalysisBlock({ analysis }: DailyAnalysisBlockProps) {
  useEffect(() => {
    const id = window.setTimeout(() => trackEvent("analysis_read"), 30_000);
    return () => window.clearTimeout(id);
  }, []);

  if (!analysis) {
    return (
      <section className="rounded-2xl border border-white/10 bg-[#111111] p-6">
        <p className="text-zinc-300">Pre-market analysis will be posted before 9:15 AM.</p>
      </section>
    );
  }

  const postedAtLabel = analysis.posted_at ? new Date(analysis.posted_at).toLocaleTimeString() : "--";

  const badgeClass =
    analysis.market_bias === "bullish"
      ? "bg-[#00FF7F]/20 text-[#00FF7F]"
      : analysis.market_bias === "bearish"
        ? "bg-[#FF4444]/20 text-[#FF8f8f]"
        : "bg-[#ffaa33]/20 text-[#ffc67a]";

  return (
    <section className="rounded-2xl border border-white/10 bg-[#111111] p-6">
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <h2 className="font-heading text-2xl text-white">{analysis.title}</h2>
        <span className={`rounded-full px-3 py-1 text-xs uppercase ${badgeClass}`}>{analysis.market_bias}</span>
      </div>
      <p className="mb-4 text-sm text-zinc-300">{analysis.key_levels}</p>
      <div className="prose prose-invert max-w-none text-zinc-200" dangerouslySetInnerHTML={{ __html: analysis.content_html }} />
      <p className="mt-4 text-xs text-zinc-500">Posted at {postedAtLabel}</p>
    </section>
  );
}
