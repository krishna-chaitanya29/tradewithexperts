"use server";

import { requireAdmin } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

function parseNumber(value: FormDataEntryValue | null, fallback = 0) {
  const raw = String(value ?? "").trim();
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseOptionalNumber(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

async function upsertSetting(key: string, value: string) {
  const client = await createClient();
  const { error } = await client
    .from("site_settings")
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });

  if (error) {
    throw new Error(`Failed to save setting ${key}: ${error.message}`);
  }
}

async function guardAdmin(action: string) {
  const user = await requireAdmin();
  const allowed = checkRateLimit(`${action}:${user.id}`, 20, 60_000);
  if (!allowed) {
    throw new Error("Rate limit exceeded");
  }
  return user;
}

export async function saveNotice(formData: FormData) {
  await guardAdmin("saveNotice");
  await upsertSetting("notice_text", String(formData.get("notice_text") ?? ""));
  revalidatePath("/");
  revalidatePath("/api/settings/notice");
  revalidatePath("/admin/settings");
}

export async function saveCommunityLinks(formData: FormData) {
  await guardAdmin("saveCommunityLinks");
  await Promise.all([
    upsertSetting("telegram_url", String(formData.get("telegram_url") ?? "")),
    upsertSetting("whatsapp_url", String(formData.get("whatsapp_url") ?? "")),
  ]);
  revalidatePath("/community");
  revalidatePath("/community/links");
  revalidatePath("/admin/settings");
}

export async function saveHeroStats(formData: FormData) {
  await guardAdmin("saveHeroStats");
  await Promise.all([
    upsertSetting("total_calls", String(formData.get("total_calls") ?? "0")),
    upsertSetting("win_rate", String(formData.get("win_rate") ?? "0")),
    upsertSetting("avg_monthly_return", String(formData.get("avg_monthly_return") ?? "0")),
  ]);
  revalidatePath("/");
  revalidatePath("/admin/settings");
}

export async function saveHomeAlerts(formData: FormData) {
  await guardAdmin("saveHomeAlerts");
  await Promise.all([
    upsertSetting("home_alerts_html", String(formData.get("home_alerts_html") ?? "")),
    upsertSetting("home_offer_url", String(formData.get("home_offer_url") ?? "/community")),
  ]);
  revalidatePath("/");
  revalidatePath("/admin/settings");
}

export async function saveHomepageCopy(formData: FormData) {
  await guardAdmin("saveHomepageCopy");
  await Promise.all([
    upsertSetting("hero_text", String(formData.get("hero_text") ?? "")),
    upsertSetting("about_text", String(formData.get("about_text") ?? "")),
    upsertSetting("how_we_trade_text", String(formData.get("how_we_trade_text") ?? "")),
  ]);
  revalidatePath("/");
  revalidatePath("/admin/settings");
}

export async function saveHomepageLayout(formData: FormData) {
  await guardAdmin("saveHomepageLayout");
  await upsertSetting(
    "home_section_order",
    String(formData.get("home_section_order") ?? "announcements,alerts,todays-trades,about,community-cta,all-pages"),
  );
  revalidatePath("/");
  revalidatePath("/admin/settings");
}

export async function saveLiveTemplates(formData: FormData) {
  await guardAdmin("saveLiveTemplates");
  await Promise.all([
    upsertSetting("template_nifty_target", String(formData.get("template_nifty_target") ?? "60")),
    upsertSetting("template_nifty_sl", String(formData.get("template_nifty_sl") ?? "35")),
    upsertSetting("template_banknifty_target", String(formData.get("template_banknifty_target") ?? "150")),
    upsertSetting("template_banknifty_sl", String(formData.get("template_banknifty_sl") ?? "90")),
    upsertSetting("template_finnifty_target", String(formData.get("template_finnifty_target") ?? "45")),
    upsertSetting("template_finnifty_sl", String(formData.get("template_finnifty_sl") ?? "25")),
  ]);
  revalidatePath("/admin/settings");
  revalidatePath("/admin/live-desk");
}

export async function saveContentBlock(formData: FormData) {
  await guardAdmin("saveContentBlock");
  const client = await createClient();
  await client.from("content_blocks").upsert(
    {
      block_key: String(formData.get("block_key") ?? ""),
      content_html: String(formData.get("content_html") ?? ""),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "block_key" },
  );
  revalidatePath("/");
  revalidatePath("/admin/settings");
}

export async function createTrade(formData: FormData) {
  await guardAdmin("createTrade");
  const client = await createClient();

  const target1 = parseOptionalNumber(formData.get("target_1"));
  const target2 = parseOptionalNumber(formData.get("target_2"));
  const target3 = parseOptionalNumber(formData.get("target_3"));
  const legacyTarget = parseOptionalNumber(formData.get("target"));
  const normalizedTarget = target1 ?? target2 ?? target3 ?? legacyTarget ?? 0;

  await client.from("trades").insert({
    date: String(formData.get("date") ?? ""),
    entry_price: parseNumber(formData.get("entry_price")),
    target: normalizedTarget,
    target_1: target1,
    target_2: target2,
    target_3: target3,
    stop_loss: parseNumber(formData.get("stop_loss")),
    result: String(formData.get("result") ?? "open"),
    points: parseNumber(formData.get("points")),
    notes: String(formData.get("notes") ?? ""),
    screenshot_url: String(formData.get("screenshot_url") ?? "") || null,
  });
  revalidatePath("/proof/daily");
  revalidatePath("/");
  revalidatePath("/admin/trades");
}

export async function updateTrade(formData: FormData) {
  await guardAdmin("updateTrade");
  const client = await createClient();

  const id = String(formData.get("id") ?? "");
  const target1 = parseOptionalNumber(formData.get("target_1"));
  const target2 = parseOptionalNumber(formData.get("target_2"));
  const target3 = parseOptionalNumber(formData.get("target_3"));
  const legacyTarget = parseOptionalNumber(formData.get("target"));
  const normalizedTarget = target1 ?? target2 ?? target3 ?? legacyTarget ?? 0;

  await client
    .from("trades")
    .update({
      date: String(formData.get("date") ?? ""),
      entry_price: parseNumber(formData.get("entry_price")),
      target: normalizedTarget,
      target_1: target1,
      target_2: target2,
      target_3: target3,
      stop_loss: parseNumber(formData.get("stop_loss")),
      result: String(formData.get("result") ?? "open"),
      points: parseNumber(formData.get("points")),
      notes: String(formData.get("notes") ?? ""),
      screenshot_url: String(formData.get("screenshot_url") ?? "") || null,
    })
    .eq("id", id);

  revalidatePath("/proof/daily");
  revalidatePath("/");
  revalidatePath("/admin/trades");
}

export async function duplicateLatestTrade() {
  await guardAdmin("duplicateLatestTrade");
  const client = await createClient();

  const { data: latestTrade } = await client
    .from("trades")
    .select("*")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!latestTrade) {
    return;
  }

  const today = new Date().toISOString().slice(0, 10);
  await client.from("trades").insert({
    date: today,
    entry_price: latestTrade.entry_price,
    target: latestTrade.target,
    target_1: latestTrade.target_1,
    target_2: latestTrade.target_2,
    target_3: latestTrade.target_3,
    stop_loss: latestTrade.stop_loss,
    result: "open",
    points: 0,
    notes: latestTrade.notes,
    screenshot_url: latestTrade.screenshot_url,
  });

  revalidatePath("/proof/daily");
  revalidatePath("/");
  revalidatePath("/admin/trades");
}

export async function saveMonthlySummary(formData: FormData) {
  await guardAdmin("saveMonthlySummary");
  const client = await createClient();
  await client.from("monthly_summaries").upsert(
    {
      month: String(formData.get("month") ?? ""),
      summary_text: String(formData.get("summary_text") ?? ""),
      created_at: new Date().toISOString(),
    },
    { onConflict: "month" },
  );
  revalidatePath("/proof/monthly");
  revalidatePath("/admin/trades");
}

export async function saveDailyAnalysis(formData: FormData) {
  await guardAdmin("saveDailyAnalysis");
  const client = await createClient();
  await client.from("daily_analysis").upsert(
    {
      date: String(formData.get("date") ?? ""),
      title: String(formData.get("title") ?? ""),
      content_html: String(formData.get("content_html") ?? ""),
      market_bias: String(formData.get("market_bias") ?? "sideways"),
      key_levels: String(formData.get("key_levels") ?? ""),
      updated_at: new Date().toISOString(),
      posted_at: new Date().toISOString(),
    },
    { onConflict: "date" },
  );
  revalidatePath("/live");
  revalidatePath("/admin/live-desk");
}

export async function createLiveTrade(formData: FormData) {
  await guardAdmin("createLiveTrade");
  const client = await createClient();
  await client.from("live_trades").insert({
    date: String(formData.get("date") ?? ""),
    instrument: String(formData.get("instrument") ?? "NIFTY50"),
    trade_type: String(formData.get("trade_type") ?? "BUY"),
    entry_price: parseNumber(formData.get("entry_price")),
    target_price: parseNumber(formData.get("target_price")),
    stop_loss: parseNumber(formData.get("stop_loss")),
    current_price: parseOptionalNumber(formData.get("current_price")),
    status: String(formData.get("status") ?? "pending"),
    posted_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  revalidatePath("/live");
  revalidatePath("/admin/live-desk");
}

export async function updateLiveTrade(formData: FormData) {
  await guardAdmin("updateLiveTrade");
  const client = await createClient();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "live");
  await client
    .from("live_trades")
    .update({
      date: String(formData.get("date") ?? ""),
      instrument: String(formData.get("instrument") ?? "NIFTY50"),
      trade_type: String(formData.get("trade_type") ?? "BUY"),
      entry_price: parseNumber(formData.get("entry_price")),
      target_price: parseNumber(formData.get("target_price")),
      stop_loss: parseNumber(formData.get("stop_loss")),
      current_price: parseOptionalNumber(formData.get("current_price")),
      status,
      admin_message: String(formData.get("admin_message") ?? ""),
      message_type: String(formData.get("message_type") ?? "info"),
      points_result: parseOptionalNumber(formData.get("points_result")),
      updated_at: new Date().toISOString(),
      closed_at: ["target_hit", "sl_hit", "closed"].includes(status)
        ? new Date().toISOString()
        : null,
    })
    .eq("id", id);

  const reactionMessage = String(formData.get("reaction_message") ?? "");
  if (reactionMessage) {
    await client.from("trade_reactions").insert({
      trade_id: id,
      reaction_type: "result",
      message: reactionMessage,
      created_at: new Date().toISOString(),
    });
  }

  revalidatePath("/live");
  revalidatePath("/admin/live-desk");
}

export async function bulkUpdateLiveTrades(formData: FormData) {
  await guardAdmin("bulkUpdateLiveTrades");
  const client = await createClient();

  const ids = formData
    .getAll("ids")
    .map((value) => String(value))
    .filter(Boolean);

  if (ids.length === 0) {
    return;
  }

  const status = String(formData.get("status") ?? "live");
  const messageType = String(formData.get("message_type") ?? "info");
  const adminMessage = String(formData.get("admin_message") ?? "").trim();
  const reactionMessage = String(formData.get("reaction_message") ?? "").trim();

  await client
    .from("live_trades")
    .update({
      status,
      message_type: messageType,
      admin_message: adminMessage || null,
      updated_at: new Date().toISOString(),
      closed_at: ["target_hit", "sl_hit", "closed"].includes(status)
        ? new Date().toISOString()
        : null,
    })
    .in("id", ids);

  if (reactionMessage) {
    await client.from("trade_reactions").insert(
      ids.map((tradeId) => ({
        trade_id: tradeId,
        reaction_type: "update",
        message: reactionMessage,
        created_at: new Date().toISOString(),
      })),
    );
  }

  revalidatePath("/live");
  revalidatePath("/admin/live-desk");
}
