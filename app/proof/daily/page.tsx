import { TradeCard } from "@/components/TradeCard";
import { getTrades } from "@/lib/data";

export const revalidate = 300;

export default async function DailyProofPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const params = await searchParams;
  const selectedMonth = params.month;
  const trades = await getTrades();

  const filteredTrades = selectedMonth
    ? trades.filter((trade) => trade.date.startsWith(selectedMonth))
    : trades;

  const months = [...new Set(trades.map((trade) => trade.date.slice(0, 7)))];
  const wins = filteredTrades.filter((trade) => trade.result === "hit").length;
  const slHits = filteredTrades.filter((trade) => trade.result === "sl").length;
  const totalPoints = filteredTrades.reduce((acc, trade) => acc + Number(trade.points ?? 0), 0);

  const targetText = (trade: (typeof filteredTrades)[number]) => {
    const targets = [trade.target_1, trade.target_2, trade.target_3].filter((value): value is number => value != null);
    return targets.length > 0 ? targets.join(" / ") : String(trade.target);
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <h1 className="font-heading text-4xl text-white">Daily Trades</h1>
      <p className="mt-2 text-zinc-400">Structured trade ledger with transparent wins, SL hits, and points.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        <a href="/proof/daily" className="rounded-full border border-white/20 px-3 py-1 text-sm text-zinc-200">
          All
        </a>
        {months.map((month) => (
          <a
            key={month}
            href={`/proof/daily?month=${month}`}
            className={`rounded-full border px-3 py-1 text-sm ${selectedMonth === month ? "border-[#00AAFF] text-white" : "border-white/20 text-zinc-300"}`}
          >
            {month}
          </a>
        ))}
      </div>

      <section className="mt-6 grid gap-3 sm:grid-cols-3">
        <article className="rounded-xl border border-white/10 bg-[#111111] p-4">
          <p className="text-xs uppercase tracking-wide text-zinc-400">Wins</p>
          <p className="mt-1 text-2xl text-[#00FF7F]">{wins}</p>
        </article>
        <article className="rounded-xl border border-white/10 bg-[#111111] p-4">
          <p className="text-xs uppercase tracking-wide text-zinc-400">SL Hits</p>
          <p className="mt-1 text-2xl text-[#FF4444]">{slHits}</p>
        </article>
        <article className="rounded-xl border border-white/10 bg-[#111111] p-4">
          <p className="text-xs uppercase tracking-wide text-zinc-400">Net Points</p>
          <p className={`mt-1 text-2xl ${totalPoints >= 0 ? "text-[#00FF7F]" : "text-[#FF4444]"}`}>{totalPoints}</p>
        </article>
      </section>

      <section className="mt-8 overflow-x-auto rounded-xl border border-white/10 bg-[#111111]">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#0f0f0f] text-zinc-300">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Entry</th>
              <th className="px-4 py-3">Targets</th>
              <th className="px-4 py-3">SL</th>
              <th className="px-4 py-3">Result</th>
              <th className="px-4 py-3">Points</th>
            </tr>
          </thead>
          <tbody>
            {filteredTrades.map((trade) => (
              <tr key={trade.id} className="border-t border-white/10 text-zinc-200">
                <td className="px-4 py-3">{trade.date}</td>
                <td className="px-4 py-3">{trade.entry_price}</td>
                <td className="px-4 py-3">{targetText(trade)}</td>
                <td className="px-4 py-3">{trade.stop_loss}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      trade.result === "hit"
                        ? "bg-[#00FF7F]/20 text-[#00FF7F]"
                        : trade.result === "sl"
                          ? "bg-[#FF4444]/20 text-[#FF4444]"
                          : "bg-[#00AAFF]/20 text-[#8fdfff]"
                    }`}
                  >
                    {trade.result.toUpperCase()}
                  </span>
                </td>
                <td className={`px-4 py-3 ${Number(trade.points) >= 0 ? "text-[#00FF7F]" : "text-[#FF4444]"}`}>{trade.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredTrades.map((trade) => (
          <div key={trade.id}>
            <TradeCard trade={trade} />
          </div>
        ))}
      </section>
    </main>
  );
}
