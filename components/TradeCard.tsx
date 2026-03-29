import type { TradeEntry } from "@/lib/types";
import Image from "next/image";

type TradeCardProps = {
  trade: TradeEntry;
};

export function TradeCard({ trade }: TradeCardProps) {
  const isWin = trade.result === "hit";
  const targets = [trade.target_1, trade.target_2, trade.target_3].filter((value): value is number => value != null);
  const targetLabel = targets.length > 0 ? targets.join(" / ") : String(trade.target);

  return (
    <article
      className={`rounded-2xl border bg-[#1a1a1a] p-5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_0_35px_rgba(0,170,255,0.2)] ${
        isWin ? "border-[#00FF7F]/60" : "border-[#FF4444]/60"
      }`}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-lg text-white">{trade.date}</h3>
        <span className={`rounded-full px-3 py-1 text-xs ${isWin ? "bg-[#00FF7F]/20 text-[#00FF7F]" : "bg-[#FF4444]/20 text-[#FF4444]"}`}>
          {isWin ? "Target Hit" : "SL Hit"}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-zinc-300">
        <p>Entry: {trade.entry_price}</p>
        <p>Targets: {targetLabel}</p>
        <p>SL: {trade.stop_loss}</p>
        <p>Points: {trade.points}</p>
      </div>

      {trade.notes ? <p className="mt-4 text-sm text-zinc-400">{trade.notes}</p> : null}

      {trade.screenshot_url ? (
        <div className="relative mt-4 h-40 overflow-hidden rounded-lg">
          <Image src={trade.screenshot_url} alt="Trade proof" fill className="object-cover" />
        </div>
      ) : null}
    </article>
  );
}
