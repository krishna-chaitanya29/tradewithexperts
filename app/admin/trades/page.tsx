import { createTrade, duplicateLatestTrade, saveMonthlySummary, updateTrade } from "@/app/admin/actions";
import { AdminRealtimeRefresh } from "@/components/AdminRealtimeRefresh";
import { AdminRichTextField } from "@/components/AdminRichTextField";
import { AutoPointsButton } from "@/components/AutoPointsButton";
import { ScreenshotUploader } from "@/components/ScreenshotUploader";
import { requireAdmin } from "@/lib/auth";
import { getMonthlySummaries, getTrades } from "@/lib/data";

export default async function AdminTradesPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; result?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const [monthly, trades] = await Promise.all([getMonthlySummaries(), getTrades()]);

  const from = params.from ?? "";
  const to = params.to ?? "";
  const result = params.result ?? "";

  const filteredTrades = trades.filter((trade) => {
    if (from && trade.date < from) return false;
    if (to && trade.date > to) return false;
    if (result && trade.result !== result) return false;
    return true;
  });

  return (
    <main className="mx-auto w-full max-w-4xl space-y-8 px-4 py-10">
      <h1 className="font-heading text-4xl text-white">Trades Manager</h1>
      <AdminRealtimeRefresh />

      <form action={createTrade} className="rounded-xl border border-white/10 bg-[#111111] p-5">
        <h2 className="font-heading text-xl text-white">Daily Trade Entry</h2>
        <p className="mt-2 text-sm text-zinc-400">Log multi-target calls using T1, T2, and optional T3 levels.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <input type="date" name="date" className="rounded-lg border border-white/20 bg-[#0f0f0f] px-3 py-2 text-sm text-white" required />
          <select name="trade_side" defaultValue="BUY" className="rounded-lg border border-white/20 bg-[#0f0f0f] px-3 py-2 text-sm text-white">
            <option value="BUY">BUY (Long)</option>
            <option value="SELL">SELL (Short)</option>
          </select>
          <input type="number" step="0.01" name="entry_price" placeholder="Entry price" className="rounded-lg border border-white/20 bg-[#0f0f0f] px-3 py-2 text-sm text-white" required />
          <input type="number" step="0.01" name="target_1" placeholder="Target 1 (T1)" className="rounded-lg border border-white/20 bg-[#0f0f0f] px-3 py-2 text-sm text-white" required />
          <input type="number" step="0.01" name="target_2" placeholder="Target 2 (T2)" className="rounded-lg border border-white/20 bg-[#0f0f0f] px-3 py-2 text-sm text-white" />
          <input type="number" step="0.01" name="target_3" placeholder="Target 3 (optional)" className="rounded-lg border border-white/20 bg-[#0f0f0f] px-3 py-2 text-sm text-white" />
          <select name="achieved_target" defaultValue="target_1" className="rounded-lg border border-white/20 bg-[#0f0f0f] px-3 py-2 text-sm text-white">
            <option value="target_1">Hit at T1</option>
            <option value="target_2">Hit at T2</option>
            <option value="target_3">Hit at T3</option>
          </select>
          <input type="number" step="0.01" name="stop_loss" placeholder="Stop loss" className="rounded-lg border border-white/20 bg-[#0f0f0f] px-3 py-2 text-sm text-white" required />
          <select name="result" className="rounded-lg border border-white/20 bg-[#0f0f0f] px-3 py-2 text-sm text-white">
            <option value="hit">Target Hit</option>
            <option value="sl">SL Hit</option>
            <option value="open">Open</option>
          </select>
          <input type="number" step="0.01" name="points" placeholder="Points" className="rounded-lg border border-white/20 bg-[#0f0f0f] px-3 py-2 text-sm text-white" required />
        </div>
        <AutoPointsButton
          className="mt-3"
          pointsFieldName="points"
          entryFieldName="entry_price"
          stopFieldName="stop_loss"
          sideFieldName="trade_side"
          outcomeFieldName="result"
          hitOutcomeValue="hit"
          slOutcomeValue="sl"
          targetFieldNames={["target_1", "target_2", "target_3", "target"]}
          achievedTargetFieldName="achieved_target"
        />
        <div className="mt-3">
          <AdminRichTextField name="notes" />
        </div>
        <div className="mt-3">
          <ScreenshotUploader name="screenshot_url" />
        </div>
        <button className="mt-3 rounded bg-[#00AAFF] px-4 py-2 font-semibold text-black">Save Trade</button>
      </form>

      <form action={duplicateLatestTrade} className="rounded-xl border border-white/10 bg-[#111111] p-4">
        <h2 className="font-heading text-lg text-white">Quick Duplicate</h2>
        <p className="mt-1 text-sm text-zinc-400">Create today&apos;s draft from the latest trade record (status: open, points: 0).</p>
        <button className="mt-3 rounded bg-[#FFD700] px-4 py-2 font-semibold text-black">Duplicate Latest Trade</button>
      </form>

      <section className="rounded-xl border border-white/10 bg-[#111111] p-5">
        <h2 className="font-heading text-xl text-white">Trade History Editor</h2>
        <p className="mt-2 text-sm text-zinc-400">Review and update historical trades from a single workspace.</p>
        <form method="get" className="mt-3 grid gap-2 rounded-lg border border-white/10 p-3 md:grid-cols-4">
          <input type="date" name="from" defaultValue={from} className="rounded-md border border-white/20 bg-[#0f0f0f] px-2 py-1 text-sm text-white" />
          <input type="date" name="to" defaultValue={to} className="rounded-md border border-white/20 bg-[#0f0f0f] px-2 py-1 text-sm text-white" />
          <select name="result" defaultValue={result} className="rounded-md border border-white/20 bg-[#0f0f0f] px-2 py-1 text-sm text-white">
            <option value="">All Results</option>
            <option value="hit">Target Hit</option>
            <option value="sl">SL Hit</option>
            <option value="open">Open</option>
          </select>
          <div className="flex gap-2">
            <button className="rounded bg-[#00AAFF] px-3 py-1 text-sm font-semibold text-black">Apply</button>
            <a href="/admin/trades" className="rounded border border-white/20 px-3 py-1 text-sm text-zinc-300">Reset</a>
          </div>
        </form>
        <div className="mt-4 space-y-3">
          {filteredTrades.length === 0 ? (
            <p className="text-sm text-zinc-400">No historical trades found for the selected filters.</p>
          ) : (
            filteredTrades.map((trade) => (
              <form key={trade.id} action={updateTrade} className="space-y-2 rounded-lg border border-white/10 p-3">
                <input type="hidden" name="id" value={trade.id} />
                <div className="grid gap-2 md:grid-cols-4">
                  <input type="date" name="date" defaultValue={trade.date} className="rounded-md border border-white/20 bg-[#0f0f0f] px-2 py-1 text-sm text-white" required />
                  <select name="trade_side" defaultValue="BUY" className="rounded-md border border-white/20 bg-[#0f0f0f] px-2 py-1 text-sm text-white">
                    <option value="BUY">BUY (Long)</option>
                    <option value="SELL">SELL (Short)</option>
                  </select>
                  <input type="number" step="0.01" name="entry_price" defaultValue={trade.entry_price} placeholder="Entry" className="rounded-md border border-white/20 bg-[#0f0f0f] px-2 py-1 text-sm text-white" required />
                  <input type="number" step="0.01" name="target_1" defaultValue={trade.target_1 ?? trade.target} placeholder="T1" className="rounded-md border border-white/20 bg-[#0f0f0f] px-2 py-1 text-sm text-white" required />
                  <input type="number" step="0.01" name="target_2" defaultValue={trade.target_2 ?? ""} placeholder="T2" className="rounded-md border border-white/20 bg-[#0f0f0f] px-2 py-1 text-sm text-white" />
                  <input type="number" step="0.01" name="target_3" defaultValue={trade.target_3 ?? ""} placeholder="T3" className="rounded-md border border-white/20 bg-[#0f0f0f] px-2 py-1 text-sm text-white" />
                  <select name="achieved_target" defaultValue="target_1" className="rounded-md border border-white/20 bg-[#0f0f0f] px-2 py-1 text-sm text-white">
                    <option value="target_1">Hit at T1</option>
                    <option value="target_2">Hit at T2</option>
                    <option value="target_3">Hit at T3</option>
                  </select>
                  <input type="number" step="0.01" name="stop_loss" defaultValue={trade.stop_loss} placeholder="SL" className="rounded-md border border-white/20 bg-[#0f0f0f] px-2 py-1 text-sm text-white" required />
                  <input type="number" step="0.01" name="points" defaultValue={trade.points} placeholder="Points" className="rounded-md border border-white/20 bg-[#0f0f0f] px-2 py-1 text-sm text-white" required />
                  <select name="result" defaultValue={trade.result} className="rounded-md border border-white/20 bg-[#0f0f0f] px-2 py-1 text-sm text-white">
                    <option value="hit">Target Hit</option>
                    <option value="sl">SL Hit</option>
                    <option value="open">Open</option>
                  </select>
                </div>
                <textarea
                  name="notes"
                  defaultValue={trade.notes ?? ""}
                  placeholder="Notes"
                  className="h-20 w-full rounded-md border border-white/20 bg-[#0f0f0f] p-2 text-sm text-zinc-200"
                />
                <input
                  name="screenshot_url"
                  defaultValue={trade.screenshot_url ?? ""}
                  placeholder="Screenshot URL (optional)"
                  className="w-full rounded-md border border-white/20 bg-[#0f0f0f] px-2 py-1 text-sm text-white"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <AutoPointsButton
                    pointsFieldName="points"
                    entryFieldName="entry_price"
                    stopFieldName="stop_loss"
                    sideFieldName="trade_side"
                    outcomeFieldName="result"
                    hitOutcomeValue="hit"
                    slOutcomeValue="sl"
                    targetFieldNames={["target_1", "target_2", "target_3", "target"]}
                    achievedTargetFieldName="achieved_target"
                  />
                  <button className="rounded bg-[#1f2937] px-3 py-1 text-sm text-white">Update Trade</button>
                </div>
              </form>
            ))
          )}
        </div>
      </section>

      <section className="rounded-xl border border-white/10 bg-[#111111] p-5">
        <h2 className="font-heading text-xl text-white">Monthly Note Editor</h2>
        <div className="mt-4 space-y-3">
          {monthly.map((month) => (
            <form key={month.id} action={saveMonthlySummary} className="space-y-2 rounded-lg border border-white/10 p-3">
              <input name="month" defaultValue={month.month} className="w-full rounded-md border border-white/20 bg-[#0f0f0f] px-2 py-1 text-sm text-white" />
              <AdminRichTextField name="summary_text" defaultValue={month.summary_text ?? ""} />
              <button className="rounded bg-[#1f2937] px-3 py-1 text-sm text-white">Save Summary</button>
            </form>
          ))}
        </div>
      </section>
    </main>
  );
}
