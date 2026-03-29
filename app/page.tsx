import { SectionMotion } from "@/components/SectionMotion";
import { StatsCounter } from "@/components/StatsCounter";
import { TradeCard } from "@/components/TradeCard";
import { getContentBlocks, getHeroStats, getSiteSettings, getTrades } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function Home() {
  const [stats, settings, trades, blocks] = await Promise.all([
    getHeroStats(),
    getSiteSettings(),
    getTrades(),
    getContentBlocks(),
  ]);

  const heroText =
    settings.find((entry) => entry.key === "hero_text")?.value ??
    "We trade like institutions. Proof every single day.";

  const aboutText =
    settings.find((entry) => entry.key === "about_text")?.value ??
    "A process-driven NIFTY50 community focused on disciplined execution.";

  const howWeTradeText =
    settings.find((entry) => entry.key === "how_we_trade_text")?.value ??
    "Every setup is planned with entry, risk, and exit before execution.";

  const homeAlertsHtml = settings.find((entry) => entry.key === "home_alerts_html")?.value ?? "";
  const homeOfferUrl = settings.find((entry) => entry.key === "home_offer_url")?.value ?? "/community";
  const noticeText = settings.find((entry) => entry.key === "notice_text")?.value ?? "Daily trade updates live now";
  const sectionOrderRaw =
    settings.find((entry) => entry.key === "home_section_order")?.value ??
    "announcements,alerts,todays-trades,about,community-cta,all-pages";

  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  let isAdmin = false;
  if (user?.id) {
    const { data } = await client.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
    isAdmin = Boolean(data?.is_admin);
  }

  const blockMap = new Map(blocks.map((block) => [block.block_key, block.content_html]));
  const allowedOrderKeys = new Set([
    "announcements",
    "alerts",
    "todays-trades",
    "about",
    "community-cta",
    "all-pages",
  ]);

  const parsedOrder = sectionOrderRaw
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry, idx, arr) => entry && allowedOrderKeys.has(entry) && arr.indexOf(entry) === idx);

  const sectionOrder = parsedOrder.length
    ? parsedOrder
    : ["announcements", "alerts", "todays-trades", "about", "community-cta", "all-pages"];

  return (
    <main>
      <section className="relative flex min-h-[88vh] items-center overflow-hidden px-4">
        <div className="hero-bg" />
        <div className="relative z-10 mx-auto w-full max-w-6xl">
          <p className="text-sm uppercase tracking-[0.2em] text-[#00AAFF]">Trade With Experts</p>
          <h1 className="mt-4 max-w-3xl font-heading text-5xl leading-tight text-white md:text-7xl">{heroText}</h1>
          <p className="mt-5 max-w-2xl text-zinc-300">Transparent NIFTY50 trading journal with live room updates, disciplined execution, and complete accountability.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/live" className="rounded-full bg-[#FFD700] px-6 py-3 font-semibold text-black">Enter Live Room</Link>
            <Link href="/proof/daily" className="rounded-full border border-[#00AAFF]/50 px-6 py-3 font-semibold text-[#9cddff]">View Daily Trades</Link>
            {isAdmin ? (
              <Link href="/admin/settings" className="rounded-full border border-[#FFD700]/60 px-6 py-3 font-semibold text-[#FFD700]">
                Edit Content
              </Link>
            ) : null}
          </div>

          <div className="mt-10 grid gap-3 md:grid-cols-3">
            <StatsCounter label="Total Calls" value={stats.totalCalls} />
            <StatsCounter label="Win Rate" value={Math.round(stats.winRate)} suffix="%" />
            <StatsCounter label="Avg Monthly Return" value={Math.round(stats.avgMonthlyReturn)} suffix="%" />
          </div>

          <div className="mt-5 flex flex-wrap gap-3 text-sm text-zinc-300">
            <a href="#todays-trades" className="rounded-full border border-white/20 px-4 py-2 hover:border-[#00AAFF]/60">Today&apos;s Trades</a>
            <a href="#about" className="rounded-full border border-white/20 px-4 py-2 hover:border-[#00AAFF]/60">About</a>
            <a href="#community-cta" className="rounded-full border border-white/20 px-4 py-2 hover:border-[#00AAFF]/60">Community</a>
            <a href="#all-pages" className="rounded-full border border-white/20 px-4 py-2 hover:border-[#00AAFF]/60">View All Pages</a>
          </div>
        </div>
      </section>

      {sectionOrder.map((key) => {
        if (key === "announcements") {
          return (
            <SectionMotion key={key} className="mx-auto w-full max-w-6xl px-4 py-2" id="announcements">
              <div className="announcement-shell overflow-hidden rounded-xl border border-[#00AAFF]/30 bg-[#0d1620] py-3">
                <div className="announcement-track text-sm font-medium text-[#9ddfff]">
                  <span>{noticeText}</span>
                  <span>{noticeText}</span>
                  <span>{noticeText}</span>
                </div>
              </div>
            </SectionMotion>
          );
        }

        if (key === "alerts") {
          if (!homeAlertsHtml) return null;
          return (
            <SectionMotion key={key} className="mx-auto w-full max-w-6xl px-4 py-4" id="alerts">
              <div className="rounded-2xl border border-[#FFD700]/30 bg-gradient-to-r from-[#171100] to-[#111111] p-6">
                <h2 className="font-heading text-2xl text-[#FFD700]">Latest Alerts & Offers</h2>
                <div className="prose prose-invert mt-3 max-w-none text-zinc-200" dangerouslySetInnerHTML={{ __html: homeAlertsHtml }} />
                <Link href={homeOfferUrl} className="mt-4 inline-flex rounded-full bg-[#FFD700] px-5 py-2 font-semibold text-black">
                  Claim Offer
                </Link>
              </div>
            </SectionMotion>
          );
        }

        if (key === "todays-trades") {
          return (
            <SectionMotion key={key} className="mx-auto w-full max-w-6xl px-4 py-12" id="todays-trades">
              <div className="flex items-center justify-between gap-4">
                <h2 className="font-heading text-3xl text-white">Today&apos;s Trades</h2>
                <Link href="/proof/daily" className="text-sm text-[#9ddfff] underline underline-offset-4">
                  View full trade log
                </Link>
              </div>
              <p className="mt-2 text-zinc-400">Scroll horizontally on mobile for a fast desk-like review.</p>

              <div className="trade-rail mt-6 flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-2 md:overflow-visible xl:grid-cols-3">
                {trades.slice(0, 6).map((trade) => (
                  <div key={trade.id} className="min-w-[88%] snap-center md:min-w-0">
                    <TradeCard trade={trade} />
                  </div>
                ))}
              </div>
            </SectionMotion>
          );
        }

        if (key === "about") {
          return (
            <SectionMotion key={key} className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-10 md:grid-cols-2" id="about">
              <article className="rounded-2xl border border-white/10 bg-[#111111] p-6">
                <h3 className="font-heading text-2xl text-white">About</h3>
                <p className="mt-3 text-zinc-300">{aboutText}</p>
                <div className="prose prose-invert mt-3 max-w-none text-zinc-300" dangerouslySetInnerHTML={{ __html: blockMap.get("about_experts") ?? "" }} />
              </article>
              <article className="rounded-2xl border border-white/10 bg-[#111111] p-6">
                <h3 className="font-heading text-2xl text-white">How We Trade</h3>
                <p className="mt-3 text-zinc-300">{howWeTradeText}</p>
                <div className="prose prose-invert mt-3 max-w-none text-zinc-300" dangerouslySetInnerHTML={{ __html: blockMap.get("how_we_trade") ?? "" }} />
              </article>
            </SectionMotion>
          );
        }

        if (key === "community-cta") {
          return (
            <SectionMotion key={key} className="mx-auto w-full max-w-6xl px-4 pb-20" id="community-cta">
              <div className="rounded-2xl border border-[#00AAFF]/30 bg-gradient-to-r from-[#111111] to-[#0b1822] p-8">
                <h3 className="font-heading text-3xl text-white">Build Consistency With Community</h3>
                <p className="mt-3 max-w-2xl text-zinc-300">Join our free channel for daily setups, risk-first execution, and transparent reviews.</p>
                <div className="prose prose-invert mt-3 max-w-none text-zinc-300" dangerouslySetInnerHTML={{ __html: blockMap.get("community_cta") ?? "" }} />
                <Link href="/community" className="mt-5 inline-flex rounded-full bg-[#00AAFF] px-6 py-3 font-semibold text-black">Join Free Community</Link>
              </div>
            </SectionMotion>
          );
        }

        if (key === "all-pages") {
          return (
            <SectionMotion key={key} className="mx-auto w-full max-w-6xl px-4 pb-24" id="all-pages">
              <h3 className="font-heading text-3xl text-white">Explore All Pages</h3>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Link href="/live" className="rounded-xl border border-white/10 bg-[#111111] p-4 text-zinc-200 hover:border-[#00AAFF]/50">Live Trade Room</Link>
                <Link href="/proof/daily" className="rounded-xl border border-white/10 bg-[#111111] p-4 text-zinc-200 hover:border-[#00AAFF]/50">Daily Trades</Link>
                <Link href="/proof/monthly" className="rounded-xl border border-white/10 bg-[#111111] p-4 text-zinc-200 hover:border-[#00AAFF]/50">Monthly Summary</Link>
                <Link href="/community" className="rounded-xl border border-white/10 bg-[#111111] p-4 text-zinc-200 hover:border-[#00AAFF]/50">Community</Link>
                <Link href="/login" className="rounded-xl border border-white/10 bg-[#111111] p-4 text-zinc-200 hover:border-[#00AAFF]/50">Login</Link>
                <Link href="/register" className="rounded-xl border border-white/10 bg-[#111111] p-4 text-zinc-200 hover:border-[#00AAFF]/50">Register</Link>
              </div>
            </SectionMotion>
          );
        }

        return null;
      })}
    </main>
  );
}
