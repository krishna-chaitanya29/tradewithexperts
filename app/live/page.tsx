"use client";

import { DailyAnalysisBlock } from "@/components/DailyAnalysisBlock";
import { LiveTradeCard } from "@/components/LiveTradeCard";
import { MarketStatusBadge } from "@/components/MarketStatusBadge";
import { Skeleton } from "@/components/Skeleton";
import { trackEvent } from "@/lib/analytics";
import { formatISTDate } from "@/lib/market";
import type { LiveTrade, TradeReaction } from "@/lib/types";
import { useEffect, useRef, useState } from "react";
import useSWR from "swr";

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to load live room data");
  }
  return response.json();
};

export default function LivePage() {
  const [showToast, setShowToast] = useState(false);
  const lastUpdatedRef = useRef<string | null>(null);
  const statusMapRef = useRef<Map<string, string>>(new Map());
  const toastTimerRef = useRef<number | null>(null);

  const { data, isLoading } = useSWR("/api/live", fetcher, {
    refreshInterval: 30_000,
    revalidateOnFocus: true,
    onSuccess: (payload) => {
      if (lastUpdatedRef.current && lastUpdatedRef.current !== payload?.updatedAt) {
        setShowToast(true);
        if (toastTimerRef.current) {
          window.clearTimeout(toastTimerRef.current);
        }
        toastTimerRef.current = window.setTimeout(() => setShowToast(false), 2200);
      }
      if (payload?.updatedAt) {
        lastUpdatedRef.current = payload.updatedAt;
      }
    },
  });

  useEffect(() => {
    trackEvent("live_page_viewed");
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const trades: LiveTrade[] = data?.trades ?? [];
    for (const trade of trades) {
      const previous = statusMapRef.current.get(trade.id);
      if (previous && previous !== "target_hit" && trade.status === "target_hit") {
        trackEvent("target_hit_seen", { instrument: trade.instrument });
      }
      statusMapRef.current.set(trade.id, trade.status);
    }
  }, [data?.trades]);

  if (isLoading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="mt-4 h-52 w-full" />
      </main>
    );
  }

  const trades = data?.trades ?? [];
  const liveTrades = trades.filter((trade: LiveTrade) => trade.status === "live" || trade.status === "pending");
  const closedTrades = trades.filter((trade: LiveTrade) => ["target_hit", "sl_hit", "closed"].includes(trade.status));
  const reactions: TradeReaction[] = data?.reactions ?? [];

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      {showToast ? (
        <div className="fixed right-4 top-24 z-40 rounded-lg border border-[#00AAFF]/40 bg-[#0f1b22] px-4 py-2 text-sm text-[#9edfff]">
          Updated just now
        </div>
      ) : null}

      <section className="sticky top-24 z-20 mb-6 flex items-center justify-between rounded-xl border border-white/10 bg-[#111111]/95 px-4 py-3 backdrop-blur">
        <p className="text-sm text-zinc-200">{formatISTDate()}</p>
        <MarketStatusBadge />
      </section>

      <DailyAnalysisBlock analysis={data?.analysis ?? null} />

      <section className="mt-8">
        <h2 className="font-heading text-2xl text-white">Live Trades</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {liveTrades.map((trade: LiveTrade) => (
            <LiveTradeCard key={trade.id} trade={trade} reactions={reactions} />
          ))}
        </div>
      </section>

      <details className="mt-8 rounded-xl border border-white/10 bg-[#111111] p-4" open>
        <summary className="cursor-pointer font-heading text-xl text-white">Closed Trades</summary>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {closedTrades.map((trade: LiveTrade) => (
            <LiveTradeCard key={trade.id} trade={trade} reactions={reactions} />
          ))}
        </div>
      </details>
    </main>
  );
}
