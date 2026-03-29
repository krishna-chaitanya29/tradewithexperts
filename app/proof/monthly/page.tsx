import { MonthlySummaryClient } from "@/components/MonthlySummaryClient";
import { getMonthlySummaries, getTrades } from "@/lib/data";

export const revalidate = 300;

export default async function MonthlyProofPage() {
  const [monthly, trades] = await Promise.all([getMonthlySummaries(), getTrades()]);
  const summaryMap = new Map(monthly.map((item) => [item.month, item.summary_text ?? ""]));

  const grouped = new Map<string, { points: number[]; wins: number; slHits: number }>();

  for (const trade of trades) {
    const month = trade.date.slice(0, 7);
    const state = grouped.get(month) ?? { points: [], wins: 0, slHits: 0 };
    const prev = state.points[state.points.length - 1] ?? 0;
    const nextPoints = prev + Number(trade.points ?? 0);
    state.points.push(nextPoints);
    if (trade.result === "hit") {
      state.wins += 1;
    }
    if (trade.result === "sl") {
      state.slHits += 1;
    }
    grouped.set(month, state);
  }

  const items = Array.from(grouped.entries()).map(([month, state]) => {
    const totalCalls = state.points.length;
    return {
      month,
      totalCalls,
      wins: state.wins,
      slHits: state.slHits,
      winRate: totalCalls ? (state.wins / totalCalls) * 100 : 0,
      totalPoints: state.points[state.points.length - 1] ?? 0,
      summaryText: summaryMap.get(month) ?? "No monthly note added yet.",
      chart: state.points.map((value, idx) => ({ day: idx + 1, value })),
    };
  });

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <h1 className="font-heading text-4xl text-white">Monthly Summary</h1>
      <MonthlySummaryClient items={items} />
    </main>
  );
}
