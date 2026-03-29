import { bulkUpdateLiveTrades, createLiveTrade, saveDailyAnalysis, updateLiveTrade } from "@/app/admin/actions";
import { AdminRealtimeRefresh } from "@/components/AdminRealtimeRefresh";
import { AdminRichTextField } from "@/components/AdminRichTextField";
import { ApplyLiveTemplateButton } from "@/components/ApplyLiveTemplateButton";
import { AutoPointsButton } from "@/components/AutoPointsButton";
import { requireAdmin } from "@/lib/auth";
import { getSiteSettings } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLiveDeskPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; instrument?: string; status?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const [client, settings] = await Promise.all([createClient(), getSiteSettings()]);
  const { data: allLiveTrades = [] } = await client
    .from("live_trades")
    .select("*")
    .order("date", { ascending: false })
    .order("posted_at", { ascending: false });
  const liveTradeRows = allLiveTrades ?? [];

  const from = params.from ?? "";
  const to = params.to ?? "";
  const instrument = params.instrument ?? "";
  const status = params.status ?? "";

  const filteredLiveTrades = liveTradeRows.filter((trade) => {
    if (from && trade.date < from) return false;
    if (to && trade.date > to) return false;
    if (instrument && trade.instrument !== instrument) return false;
    if (status && trade.status !== status) return false;
    return true;
  });

  const settingMap = new Map(settings.map((entry) => [entry.key, entry.value]));
  const parseSetting = (key: string, fallback: number) => {
    const parsed = Number(settingMap.get(key));
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  const templateConfig = {
    NIFTY50: {
      target: parseSetting("template_nifty_target", 60),
      stop: parseSetting("template_nifty_sl", 35),
    },
    BANKNIFTY: {
      target: parseSetting("template_banknifty_target", 150),
      stop: parseSetting("template_banknifty_sl", 90),
    },
    FINNIFTY: {
      target: parseSetting("template_finnifty_target", 45),
      stop: parseSetting("template_finnifty_sl", 25),
    },
  };

  return (
    <main className="mx-auto w-full max-w-5xl space-y-8 px-4 py-10">
      <h1 className="font-heading text-4xl text-white">Live Desk</h1>
      <AdminRealtimeRefresh />

      <form action={saveDailyAnalysis} className="rounded-xl border border-white/10 bg-[#111111] p-5">
        <h2 className="font-heading text-xl text-white">Publish Daily Analysis</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <input type="date" name="date" className="rounded-lg border border-white/20 bg-[#0f0f0f] px-3 py-2 text-sm text-white" required />
          <input name="title" placeholder="Title" className="rounded-lg border border-white/20 bg-[#0f0f0f] px-3 py-2 text-sm text-white" required />
          <select name="market_bias" className="rounded-lg border border-white/20 bg-[#0f0f0f] px-3 py-2 text-sm text-white">
            <option value="bullish">Bullish</option>
            <option value="bearish">Bearish</option>
            <option value="sideways">Sideways</option>
          </select>
          <input name="key_levels" placeholder="Support / Resistance levels" className="rounded-lg border border-white/20 bg-[#0f0f0f] px-3 py-2 text-sm text-white" required />
        </div>
        <div className="mt-3">
          <AdminRichTextField name="content_html" />
        </div>
        <button className="mt-3 rounded bg-[#FFD700] px-4 py-2 font-semibold text-black">Post Analysis</button>
      </form>

      <form action={createLiveTrade} className="rounded-xl border border-white/10 bg-[#111111] p-5">
        <h2 className="font-heading text-xl text-white">Publish New Live Trade</h2>
        <p className="mt-2 text-sm text-zinc-400">Use templates to auto-fill target and stop-loss values based on instrument and trade side.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <input type="date" name="date" className="rounded-lg border border-white/20 bg-[#0f0f0f] px-3 py-2 text-sm text-white" required />
          <select name="instrument" className="rounded-lg border border-white/20 bg-[#0f0f0f] px-3 py-2 text-sm text-white">
            <option value="NIFTY50">NIFTY50</option>
            <option value="BANKNIFTY">BANKNIFTY</option>
            <option value="FINNIFTY">FINNIFTY</option>
          </select>
          <select name="trade_type" className="rounded-lg border border-white/20 bg-[#0f0f0f] px-3 py-2 text-sm text-white">
            <option value="BUY">BUY</option>
            <option value="SELL">SELL</option>
          </select>
          <input type="number" step="0.01" name="entry_price" placeholder="Entry" className="rounded-lg border border-white/20 bg-[#0f0f0f] px-3 py-2 text-sm text-white" required />
          <input type="number" step="0.01" name="target_price" placeholder="Target" className="rounded-lg border border-white/20 bg-[#0f0f0f] px-3 py-2 text-sm text-white" required />
          <input type="number" step="0.01" name="stop_loss" placeholder="SL" className="rounded-lg border border-white/20 bg-[#0f0f0f] px-3 py-2 text-sm text-white" required />
          <input type="number" step="0.01" name="current_price" placeholder="Current Price" className="rounded-lg border border-white/20 bg-[#0f0f0f] px-3 py-2 text-sm text-white" />
          <select name="status" className="rounded-lg border border-white/20 bg-[#0f0f0f] px-3 py-2 text-sm text-white">
            <option value="pending">Pending</option>
            <option value="live">Live</option>
          </select>
        </div>
        <ApplyLiveTemplateButton
          className="mt-3"
          instrumentFieldName="instrument"
          sideFieldName="trade_type"
          entryFieldName="entry_price"
          targetFieldName="target_price"
          stopFieldName="stop_loss"
          templates={templateConfig}
          currentFieldName="current_price"
        />
        <button className="mt-3 rounded bg-[#00AAFF] px-4 py-2 font-semibold text-black">Go Live</button>
      </form>

      <section className="rounded-xl border border-white/10 bg-[#111111] p-5">
        <h2 className="font-heading text-xl text-white">Update Live Trade History</h2>
        <p className="mt-2 text-sm text-zinc-400">Includes complete live trade history. You can update past entries at any time.</p>
        <form action={bulkUpdateLiveTrades} className="mt-3 space-y-3 rounded-lg border border-white/10 p-3">
          <p className="text-sm text-zinc-300">Bulk update: select multiple live trades and apply a single status update.</p>
          <select
            name="ids"
            multiple
            size={6}
            className="w-full rounded-md border border-white/20 bg-[#0f0f0f] p-2 text-sm text-white"
          >
            {filteredLiveTrades.map((trade) => (
              <option key={`bulk-${trade.id}`} value={trade.id}>
                {trade.date} | {trade.instrument} {trade.trade_type} | {trade.status}
              </option>
            ))}
          </select>
          <div className="grid gap-2 md:grid-cols-4">
            <select name="status" className="rounded-md border border-white/20 bg-[#0f0f0f] px-2 py-1 text-sm text-white">
              <option value="pending">Pending</option>
              <option value="live">Live</option>
              <option value="target_hit">Target Hit</option>
              <option value="sl_hit">SL Hit</option>
              <option value="closed">Closed</option>
            </select>
            <select name="message_type" className="rounded-md border border-white/20 bg-[#0f0f0f] px-2 py-1 text-sm text-white">
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="celebration">Celebration</option>
            </select>
            <input name="admin_message" placeholder="Admin message" className="rounded-md border border-white/20 bg-[#0f0f0f] px-2 py-1 text-sm text-white" />
            <input name="reaction_message" placeholder="Reaction message (optional)" className="rounded-md border border-white/20 bg-[#0f0f0f] px-2 py-1 text-sm text-white" />
          </div>
          <button className="rounded bg-[#FFD700] px-3 py-1 text-sm font-semibold text-black">Apply Bulk Update</button>
        </form>
        <form method="get" className="mt-3 grid gap-2 rounded-lg border border-white/10 p-3 md:grid-cols-5">
          <input type="date" name="from" defaultValue={from} className="rounded-md border border-white/20 bg-[#0f0f0f] px-2 py-1 text-sm text-white" />
          <input type="date" name="to" defaultValue={to} className="rounded-md border border-white/20 bg-[#0f0f0f] px-2 py-1 text-sm text-white" />
          <select name="instrument" defaultValue={instrument} className="rounded-md border border-white/20 bg-[#0f0f0f] px-2 py-1 text-sm text-white">
            <option value="">All Instruments</option>
            <option value="NIFTY50">NIFTY50</option>
            <option value="BANKNIFTY">BANKNIFTY</option>
            <option value="FINNIFTY">FINNIFTY</option>
          </select>
          <select name="status" defaultValue={status} className="rounded-md border border-white/20 bg-[#0f0f0f] px-2 py-1 text-sm text-white">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="live">Live</option>
            <option value="target_hit">Target Hit</option>
            <option value="sl_hit">SL Hit</option>
            <option value="closed">Closed</option>
          </select>
          <div className="flex gap-2">
            <button className="rounded bg-[#00AAFF] px-3 py-1 text-sm font-semibold text-black">Apply</button>
            <a href="/admin/live-desk" className="rounded border border-white/20 px-3 py-1 text-sm text-zinc-300">Reset</a>
          </div>
        </form>
        <div className="mt-4 space-y-4">
          {filteredLiveTrades.map((trade) => (
            <form key={trade.id} action={updateLiveTrade} className="space-y-2 rounded-lg border border-white/10 p-3">
              <input type="hidden" name="id" value={trade.id} />
              <p className="text-sm text-zinc-300">
                {trade.date} - {trade.instrument} {trade.trade_type} ({trade.status})
              </p>
              <div className="grid gap-2 md:grid-cols-4">
                <input type="date" name="date" defaultValue={trade.date} className="rounded-md border border-white/20 bg-[#0f0f0f] px-2 py-1 text-sm text-white" />
                <select name="instrument" defaultValue={trade.instrument} className="rounded-md border border-white/20 bg-[#0f0f0f] px-2 py-1 text-sm text-white">
                  <option value="NIFTY50">NIFTY50</option>
                  <option value="BANKNIFTY">BANKNIFTY</option>
                  <option value="FINNIFTY">FINNIFTY</option>
                </select>
                <select name="trade_type" defaultValue={trade.trade_type} className="rounded-md border border-white/20 bg-[#0f0f0f] px-2 py-1 text-sm text-white">
                  <option value="BUY">BUY</option>
                  <option value="SELL">SELL</option>
                </select>
                <input name="entry_price" defaultValue={trade.entry_price} placeholder="Entry" className="rounded-md border border-white/20 bg-[#0f0f0f] px-2 py-1 text-sm text-white" />
                <input name="target_price" defaultValue={trade.target_price} placeholder="Target" className="rounded-md border border-white/20 bg-[#0f0f0f] px-2 py-1 text-sm text-white" />
                <input name="stop_loss" defaultValue={trade.stop_loss} placeholder="SL" className="rounded-md border border-white/20 bg-[#0f0f0f] px-2 py-1 text-sm text-white" />
                <input name="current_price" defaultValue={trade.current_price ?? 0} placeholder="Current price" className="rounded-md border border-white/20 bg-[#0f0f0f] px-2 py-1 text-sm text-white" />
                <input name="points_result" defaultValue={trade.points_result ?? 0} placeholder="Points result" className="rounded-md border border-white/20 bg-[#0f0f0f] px-2 py-1 text-sm text-white" />
                <select name="status" defaultValue={trade.status} className="rounded-md border border-white/20 bg-[#0f0f0f] px-2 py-1 text-sm text-white">
                  <option value="pending">Pending</option>
                  <option value="live">Live</option>
                  <option value="target_hit">Target Hit</option>
                  <option value="sl_hit">SL Hit</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <textarea name="admin_message" defaultValue={trade.admin_message ?? ""} placeholder="Outcome/Admin message" className="h-20 w-full rounded-md border border-white/20 bg-[#0f0f0f] p-2 text-sm text-zinc-200" />
              <input name="reaction_message" placeholder="Reaction message" className="w-full rounded-md border border-white/20 bg-[#0f0f0f] px-2 py-1 text-sm text-white" />
              <select name="message_type" defaultValue={trade.message_type ?? "info"} className="rounded-md border border-white/20 bg-[#0f0f0f] px-2 py-1 text-sm text-white">
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="celebration">Celebration</option>
              </select>
              <div className="flex flex-wrap items-center gap-2">
                <AutoPointsButton
                  pointsFieldName="points_result"
                  entryFieldName="entry_price"
                  stopFieldName="stop_loss"
                  sideFieldName="trade_type"
                  outcomeFieldName="status"
                  hitOutcomeValue="target_hit"
                  slOutcomeValue="sl_hit"
                  targetFieldNames={["target_price"]}
                  currentPriceFieldName="current_price"
                />
                <button className="rounded bg-[#1f2937] px-3 py-1 text-sm text-white">Update Trade</button>
              </div>
            </form>
          ))}
        </div>
      </section>
    </main>
  );
}
