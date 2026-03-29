import { AdminRealtimeRefresh } from "@/components/AdminRealtimeRefresh";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

const cards = [
  { href: "/admin/settings", title: "Settings Management", description: "Manage notice bar, links, statistics, and content blocks." },
  { href: "/admin/trades", title: "Trade Management", description: "Manage daily trade logs and monthly summaries." },
  { href: "/admin/live-desk", title: "Live Desk", description: "Publish daily analysis and manage live trade updates." },
  { href: "/admin/clients", title: "Client Insights", description: "Review registrations, growth trends, and the user directory." },
];

export default async function AdminHomePage() {
  await requireAdmin();
  const client = await createClient();

  const [{ count: userCount }, { count: tradeCount }, { count: liveCount }] = await Promise.all([
    client.from("profiles").select("id", { count: "exact", head: true }),
    client.from("trades").select("id", { count: "exact", head: true }),
    client.from("live_trades").select("id", { count: "exact", head: true }),
  ]);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <h1 className="font-heading text-4xl text-white">Admin Dashboard</h1>
      <p className="mt-2 text-zinc-400">Manage platform settings, trade proof, and live desk operations.</p>
      <div className="mt-2">
        <AdminRealtimeRefresh />
      </div>

      <section className="mt-6 grid gap-3 sm:grid-cols-3">
        <article className="rounded-xl border border-white/10 bg-[#111111] p-4">
          <p className="text-xs uppercase tracking-wide text-zinc-400">Clients</p>
          <p className="mt-1 text-2xl text-white">{userCount ?? 0}</p>
        </article>
        <article className="rounded-xl border border-white/10 bg-[#111111] p-4">
          <p className="text-xs uppercase tracking-wide text-zinc-400">Historical Trades</p>
          <p className="mt-1 text-2xl text-[#00AAFF]">{tradeCount ?? 0}</p>
        </article>
        <article className="rounded-xl border border-white/10 bg-[#111111] p-4">
          <p className="text-xs uppercase tracking-wide text-zinc-400">Live Trades</p>
          <p className="mt-1 text-2xl text-[#FFD700]">{liveCount ?? 0}</p>
        </article>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        {cards.map((card) => (
          <Link key={card.href} href={card.href} className="rounded-xl border border-white/10 bg-[#111111] p-5 transition hover:-translate-y-1 hover:border-[#00AAFF]/50">
            <h2 className="font-heading text-xl text-white">{card.title}</h2>
            <p className="mt-2 text-sm text-zinc-400">{card.description}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
