"use client";

import { ConfettiBurst } from "@/components/ConfettiBurst";
import { OutcomeMessage } from "@/components/OutcomeMessage";
import { TradeProgressBar } from "@/components/TradeProgressBar";
import { trackEvent } from "@/lib/analytics";
import type { LiveTrade, TradeReaction } from "@/lib/types";
import { motion } from "framer-motion";

type LiveTradeCardProps = {
  trade: LiveTrade;
  reactions: TradeReaction[];
};

export function LiveTradeCard({ trade, reactions }: LiveTradeCardProps) {
  const latestReaction = reactions.find((reaction) => reaction.trade_id === trade.id);
  const isLive = trade.status === "live";
  const isTargetHit = trade.status === "target_hit";
  const isSLHit = trade.status === "sl_hit";

  const borderClass = isTargetHit
    ? "border-[#FFD700] bg-[#FFD700]/5"
    : isSLHit
      ? "border-[#FF4444]/60"
      : "border-[#00FF7F]/60";
  const postedLabel = trade.posted_at ? new Date(trade.posted_at).toLocaleTimeString() : "--";

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`relative overflow-hidden rounded-2xl border p-5 ${borderClass}`}
      onViewportEnter={() => trackEvent("trade_card_viewed", { instrument: trade.instrument })}
    >
      {isTargetHit ? <ConfettiBurst /> : null}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-heading text-lg text-white">
          {trade.instrument} {trade.trade_type}
        </h3>
        <span
          className={`rounded-full px-3 py-1 text-xs ${
            isTargetHit
              ? "bg-[#FFD700]/20 text-[#FFD700]"
              : isSLHit
                ? "bg-[#FF4444]/20 text-[#FF7d7d]"
                : "bg-[#00FF7F]/20 text-[#00FF7F]"
          }`}
        >
          {isTargetHit ? "TARGET HIT" : isSLHit ? "SL TRIGGERED" : isLive ? "LIVE" : trade.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm text-zinc-300">
        <p>Entry: {trade.entry_price}</p>
        <p>Target: {trade.target_price}</p>
        <p>SL: {trade.stop_loss}</p>
        <p>Current: {trade.current_price ?? "--"}</p>
      </div>

      {isLive ? <div className="mt-4"><TradeProgressBar stopLoss={trade.stop_loss} target={trade.target_price} current={trade.current_price} /></div> : null}

      {trade.admin_message ? <div className="mt-4"><OutcomeMessage message={trade.admin_message} type={trade.message_type ?? "info"} /></div> : null}

      {latestReaction ? <p className="mt-3 text-xs text-zinc-400">Reaction: {latestReaction.message}</p> : null}

      <details
        className="mt-3 rounded-md border border-white/10 bg-black/20 p-2"
        onToggle={(event) => {
          const isOpen = (event.currentTarget as HTMLDetailsElement).open;
          if (isOpen) {
            trackEvent("trade_card_expanded", { instrument: trade.instrument });
          }
        }}
      >
        <summary className="cursor-pointer text-xs text-zinc-300">View Trade Context</summary>
        <p className="mt-2 text-xs text-zinc-400">Posted at {postedLabel}</p>
      </details>
    </motion.article>
  );
}
