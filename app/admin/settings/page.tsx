import { saveCommunityLinks, saveContentBlock, saveHeroStats, saveHomeAlerts, saveHomepageCopy, saveHomepageLayout, saveLiveTemplates, saveNotice } from "@/app/admin/actions";
import { AdminRealtimeRefresh } from "@/components/AdminRealtimeRefresh";
import { AdminRichTextField } from "@/components/AdminRichTextField";
import { HomeSectionOrderEditor } from "@/components/HomeSectionOrderEditor";
import { requireAdmin } from "@/lib/auth";
import { getContentBlocks, getSiteSettings } from "@/lib/data";

function getValue(items: { key: string; value: string }[], key: string, fallback = "") {
  return items.find((entry) => entry.key === key)?.value ?? fallback;
}

export default async function AdminSettingsPage() {
  await requireAdmin();
  const [settings, blocks] = await Promise.all([getSiteSettings(), getContentBlocks()]);

  return (
    <main className="mx-auto w-full max-w-4xl space-y-8 px-4 py-10">
      <h1 className="font-heading text-4xl text-white">Settings</h1>
      <AdminRealtimeRefresh />

      <form action={saveNotice} className="rounded-xl border border-white/10 bg-[#111111] p-5">
        <h2 className="font-heading text-xl text-white">Notice Manager</h2>
        <textarea name="notice_text" defaultValue={getValue(settings, "notice_text")} className="mt-3 h-24 w-full rounded-lg border border-white/20 bg-[#0f0f0f] p-3 text-sm text-zinc-200" />
        <button className="mt-3 rounded bg-[#FFD700] px-4 py-2 font-semibold text-black">Save Notice</button>
      </form>

      <form action={saveCommunityLinks} className="rounded-xl border border-white/10 bg-[#111111] p-5">
        <h2 className="font-heading text-xl text-white">Community Links</h2>
        <div className="mt-3 grid gap-3">
          <input name="telegram_url" defaultValue={getValue(settings, "telegram_url")} placeholder="Telegram URL" className="rounded-lg border border-white/20 bg-[#0f0f0f] px-3 py-2 text-sm text-white" />
          <input name="whatsapp_url" defaultValue={getValue(settings, "whatsapp_url")} placeholder="WhatsApp URL" className="rounded-lg border border-white/20 bg-[#0f0f0f] px-3 py-2 text-sm text-white" />
        </div>
        <button className="mt-3 rounded bg-[#00AAFF] px-4 py-2 font-semibold text-black">Save Links</button>
      </form>

      <form action={saveHeroStats} className="rounded-xl border border-white/10 bg-[#111111] p-5">
        <h2 className="font-heading text-xl text-white">Statistics Override</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <input name="total_calls" defaultValue={getValue(settings, "total_calls", "0")} placeholder="Total calls" className="rounded-lg border border-white/20 bg-[#0f0f0f] px-3 py-2 text-sm text-white" />
          <input name="win_rate" defaultValue={getValue(settings, "win_rate", "0")} placeholder="Win rate" className="rounded-lg border border-white/20 bg-[#0f0f0f] px-3 py-2 text-sm text-white" />
          <input name="avg_monthly_return" defaultValue={getValue(settings, "avg_monthly_return", "0")} placeholder="Avg monthly return" className="rounded-lg border border-white/20 bg-[#0f0f0f] px-3 py-2 text-sm text-white" />
        </div>
        <button className="mt-3 rounded bg-[#00FF7F] px-4 py-2 font-semibold text-black">Save Stats</button>
      </form>

      <form action={saveHomepageCopy} className="rounded-xl border border-white/10 bg-[#111111] p-5">
        <h2 className="font-heading text-xl text-white">Homepage Core Content</h2>
        <p className="mt-2 text-sm text-zinc-400">Update the core business messaging displayed across homepage sections.</p>
        <div className="mt-3 grid gap-3">
          <textarea
            name="hero_text"
            defaultValue={getValue(settings, "hero_text")}
            placeholder="Hero headline"
            className="h-20 w-full rounded-lg border border-white/20 bg-[#0f0f0f] p-3 text-sm text-zinc-200"
          />
          <textarea
            name="about_text"
            defaultValue={getValue(settings, "about_text")}
            placeholder="About section text"
            className="h-20 w-full rounded-lg border border-white/20 bg-[#0f0f0f] p-3 text-sm text-zinc-200"
          />
          <textarea
            name="how_we_trade_text"
            defaultValue={getValue(settings, "how_we_trade_text")}
            placeholder="How we trade section text"
            className="h-20 w-full rounded-lg border border-white/20 bg-[#0f0f0f] p-3 text-sm text-zinc-200"
          />
        </div>
        <button className="mt-3 rounded bg-[#00AAFF] px-4 py-2 font-semibold text-black">Save Homepage Copy</button>
      </form>

      <form action={saveHomeAlerts} className="rounded-xl border border-white/10 bg-[#111111] p-5">
        <h2 className="font-heading text-xl text-white">Home Alerts & Offers</h2>
        <p className="mt-2 text-sm text-zinc-400">This block appears on the homepage and supports alerts, announcements, and offers.</p>
        <div className="mt-3">
          <AdminRichTextField name="home_alerts_html" defaultValue={getValue(settings, "home_alerts_html", "")} />
        </div>
        <input name="home_offer_url" defaultValue={getValue(settings, "home_offer_url", "/community")} placeholder="Offer CTA URL (e.g. /community)" className="mt-3 w-full rounded-lg border border-white/20 bg-[#0f0f0f] px-3 py-2 text-sm text-white" />
        <button className="mt-3 rounded bg-[#FFD700] px-4 py-2 font-semibold text-black">Save Alerts & Offers</button>
      </form>

      <form action={saveHomepageLayout} className="rounded-xl border border-white/10 bg-[#111111] p-5">
        <h2 className="font-heading text-xl text-white">Homepage Builder</h2>
        <p className="mt-2 text-sm text-zinc-400">Reorder homepage sections using drag-and-drop or the up/down controls.</p>
        <div className="mt-3">
          <HomeSectionOrderEditor
            name="home_section_order"
            defaultValue={getValue(settings, "home_section_order", "announcements,alerts,todays-trades,about,community-cta,all-pages")}
          />
        </div>
        <button className="mt-3 rounded bg-[#00AAFF] px-4 py-2 font-semibold text-black">Save Homepage Order</button>
      </form>

      <form action={saveLiveTemplates} className="rounded-xl border border-white/10 bg-[#111111] p-5">
        <h2 className="font-heading text-xl text-white">Live Template Manager</h2>
        <p className="mt-2 text-sm text-zinc-400">Configure default target and stop-loss point distances used in Live Desk templates.</p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <input
            name="template_nifty_target"
            defaultValue={getValue(settings, "template_nifty_target", "60")}
            placeholder="NIFTY target points"
            className="rounded-lg border border-white/20 bg-[#0f0f0f] px-3 py-2 text-sm text-white"
          />
          <input
            name="template_nifty_sl"
            defaultValue={getValue(settings, "template_nifty_sl", "35")}
            placeholder="NIFTY stop-loss points"
            className="rounded-lg border border-white/20 bg-[#0f0f0f] px-3 py-2 text-sm text-white"
          />
          <input
            name="template_banknifty_target"
            defaultValue={getValue(settings, "template_banknifty_target", "150")}
            placeholder="BANKNIFTY target points"
            className="rounded-lg border border-white/20 bg-[#0f0f0f] px-3 py-2 text-sm text-white"
          />
          <input
            name="template_banknifty_sl"
            defaultValue={getValue(settings, "template_banknifty_sl", "90")}
            placeholder="BANKNIFTY stop-loss points"
            className="rounded-lg border border-white/20 bg-[#0f0f0f] px-3 py-2 text-sm text-white"
          />
          <input
            name="template_finnifty_target"
            defaultValue={getValue(settings, "template_finnifty_target", "45")}
            placeholder="FINNIFTY target points"
            className="rounded-lg border border-white/20 bg-[#0f0f0f] px-3 py-2 text-sm text-white"
          />
          <input
            name="template_finnifty_sl"
            defaultValue={getValue(settings, "template_finnifty_sl", "25")}
            placeholder="FINNIFTY stop-loss points"
            className="rounded-lg border border-white/20 bg-[#0f0f0f] px-3 py-2 text-sm text-white"
          />
        </div>
        <button className="mt-3 rounded bg-[#FFD700] px-4 py-2 font-semibold text-black">Save Live Templates</button>
      </form>

      <section className="rounded-xl border border-white/10 bg-[#111111] p-5">
        <h2 className="font-heading text-xl text-white">Content Blocks</h2>
        <div className="mt-4 space-y-3">
          {blocks.map((block) => (
            <form key={block.id} action={saveContentBlock} className="space-y-2 rounded-lg border border-white/10 p-3">
              <input type="hidden" name="block_key" defaultValue={block.block_key} />
              <p className="text-sm text-zinc-300">{block.block_key}</p>
              <AdminRichTextField name="content_html" defaultValue={block.content_html} />
              <button className="rounded bg-[#1f2937] px-3 py-1 text-sm text-white">Save Block</button>
            </form>
          ))}
        </div>
      </section>
    </main>
  );
}
