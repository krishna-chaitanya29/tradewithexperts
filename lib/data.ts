import { createClient } from "@/lib/supabase/server";
import type {
  ContentBlock,
  DailyAnalysis,
  HeroStats,
  LiveTrade,
  MonthlySummary,
  SiteSetting,
  TradeEntry,
  TradeReaction,
} from "@/lib/types";
import { addDays, format } from "date-fns";

const fallbackTrades: TradeEntry[] = Array.from({ length: 6 }).map((_, idx) => ({
  id: `demo-${idx}`,
  date: format(addDays(new Date(), -idx), "yyyy-MM-dd"),
  entry_price: 22150 + idx * 10,
  target: 22420 + idx * 8,
  target_1: 22320 + idx * 6,
  target_2: 22420 + idx * 8,
  target_3: idx % 2 === 0 ? 22510 + idx * 8 : null,
  stop_loss: 22070 + idx * 6,
  result: idx % 3 === 0 ? "sl" : "hit",
  points: idx % 3 === 0 ? -80 : 180,
  notes: "Disciplined execution with predefined risk.",
  screenshot_url: null,
}));

const fallbackMonthly: MonthlySummary[] = [
  {
    id: "m-1",
    month: format(new Date(), "yyyy-MM"),
    summary_text: "Institutional setups worked best on trend days; avoided low-conviction sessions.",
  },
];

const fallbackSettings: SiteSetting[] = [
  { key: "notice_text", value: "New trade call posted - NIFTY 22,150 -> 22,420" },
  { key: "telegram_url", value: "https://t.me/example" },
  { key: "whatsapp_url", value: "https://chat.whatsapp.com/example" },
  { key: "total_calls", value: "152" },
  { key: "win_rate", value: "74" },
  { key: "avg_monthly_return", value: "11.3" },
  { key: "hero_text", value: "We trade like institutions. Proof every single day." },
  { key: "about_text", value: "A process-driven NIFTY50 community focused on consistency and capital protection." },
  { key: "how_we_trade_text", value: "We define entry, target, and stop loss before placing any trade." },
  { key: "home_alerts_html", value: "<p><strong>Offer:</strong> Free weekly strategy review call for new members.</p>" },
  { key: "home_offer_url", value: "/community" },
  { key: "home_section_order", value: "announcements,alerts,todays-trades,about,community-cta,all-pages" },
];

const fallbackBlocks: ContentBlock[] = [
  { id: "1", block_key: "about_experts", content_html: "<p>Experienced traders with strict process and risk management.</p>" },
  { id: "2", block_key: "how_we_trade", content_html: "<p>We act only on high-probability setups and always respect stops.</p>" },
  { id: "3", block_key: "community_cta", content_html: "<p>Join our free community for daily trade ideas and accountability.</p>" },
];

const fallbackAnalysis: DailyAnalysis = {
  id: "a1",
  date: format(new Date(), "yyyy-MM-dd"),
  title: "NIFTY50 Pre-Market Analysis",
  content_html: "<p>Expect two-sided action near resistance. Plan around key levels and avoid chasing moves.</p>",
  market_bias: "sideways",
  key_levels: "Support: 22,050 | Resistance: 22,400",
  posted_at: new Date().toISOString(),
};

const fallbackLiveTrades: LiveTrade[] = [
  {
    id: "lt1",
    date: format(new Date(), "yyyy-MM-dd"),
    instrument: "NIFTY50",
    trade_type: "BUY",
    entry_price: 22150,
    target_price: 22420,
    stop_loss: 22070,
    current_price: 22280,
    status: "live",
    posted_at: new Date().toISOString(),
  },
];

const fallbackReactions: TradeReaction[] = [];

async function safeQuery<T>(
  query: () => unknown,
  fallback: T,
): Promise<T> {
  try {
    const { data, error } = (await Promise.resolve(query())) as {
      data: T | null;
      error: Error | null;
    };
    if (error || !data) {
      return fallback;
    }
    return data;
  } catch {
    return fallback;
  }
}

export async function getSiteSettings() {
  const client = await createClient();
  return safeQuery(
    () => client.from("site_settings").select("key, value, updated_at"),
    fallbackSettings,
  );
}

export async function getTrades() {
  const client = await createClient();
  return safeQuery(
    () => client.from("trades").select("*").order("date", { ascending: false }),
    fallbackTrades,
  );
}

export async function getMonthlySummaries() {
  const client = await createClient();
  return safeQuery(
    () => client.from("monthly_summaries").select("*").order("month", { ascending: false }),
    fallbackMonthly,
  );
}

export async function getContentBlocks() {
  const client = await createClient();
  return safeQuery(
    () => client.from("content_blocks").select("*").order("updated_at", { ascending: false }),
    fallbackBlocks,
  );
}

export async function getHeroStats(): Promise<HeroStats> {
  const [settings, trades] = await Promise.all([getSiteSettings(), getTrades()]);
  const valueMap = new Map(settings.map((entry) => [entry.key, entry.value]));

  const totalCalls = Number(valueMap.get("total_calls") ?? trades.length);
  const wins = trades.filter((trade) => trade.result === "hit").length;
  const winRate = Number(valueMap.get("win_rate") ?? (trades.length ? (wins / trades.length) * 100 : 0));
  const avgMonthlyReturn = Number(valueMap.get("avg_monthly_return") ?? 0);

  return {
    totalCalls,
    winRate,
    avgMonthlyReturn,
  };
}

export async function getLivePageData() {
  const client = await createClient();
  const today = format(new Date(), "yyyy-MM-dd");

  const [analysis, trades, reactions] = await Promise.all([
    safeQuery(
      () => client.from("daily_analysis").select("*").eq("date", today).maybeSingle(),
      fallbackAnalysis,
    ),
    safeQuery(
      () => client.from("live_trades").select("*").eq("date", today).order("posted_at", { ascending: false }),
      fallbackLiveTrades,
    ),
    safeQuery(
      () => client.from("trade_reactions").select("*").order("created_at", { ascending: false }),
      fallbackReactions,
    ),
  ]);

  return { analysis, trades, reactions, updatedAt: new Date().toISOString() };
}
