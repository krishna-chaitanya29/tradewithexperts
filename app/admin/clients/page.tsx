import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

function isToday(timestamp?: string | null) {
  if (!timestamp) return false;
  const d = new Date(timestamp);
  const now = new Date();
  return d.getUTCFullYear() === now.getUTCFullYear() && d.getUTCMonth() === now.getUTCMonth() && d.getUTCDate() === now.getUTCDate();
}

export default async function AdminClientsPage() {
  await requireAdmin();
  const client = await createClient();

  const { data: profiles = [], error } = await client
    .from("profiles")
    .select("id, email, full_name, phone, is_admin, created_at")
    .order("created_at", { ascending: false });

  const profileRows = profiles ?? [];
  const totalUsers = profileRows.length;
  const newToday = profileRows.filter((profile) => isToday(profile.created_at)).length;
  const totalAdmins = profileRows.filter((profile) => profile.is_admin).length;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <h1 className="font-heading text-4xl text-white">Client Insights</h1>
      <p className="mt-2 text-zinc-400">Track registrations and monitor client onboarding activity in real time.</p>

      <section className="mt-6 grid gap-3 sm:grid-cols-3">
        <article className="rounded-xl border border-white/10 bg-[#111111] p-4">
          <p className="text-xs uppercase tracking-wide text-zinc-400">Total Clients</p>
          <p className="mt-1 text-2xl text-white">{totalUsers}</p>
        </article>
        <article className="rounded-xl border border-white/10 bg-[#111111] p-4">
          <p className="text-xs uppercase tracking-wide text-zinc-400">New Today</p>
          <p className="mt-1 text-2xl text-[#00FF7F]">{newToday}</p>
        </article>
        <article className="rounded-xl border border-white/10 bg-[#111111] p-4">
          <p className="text-xs uppercase tracking-wide text-zinc-400">Admins</p>
          <p className="mt-1 text-2xl text-[#FFD700]">{totalAdmins}</p>
        </article>
      </section>

      <section className="mt-8 overflow-x-auto rounded-xl border border-white/10 bg-[#111111]">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#0f0f0f] text-zinc-300">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Registered</th>
            </tr>
          </thead>
          <tbody>
            {error ? (
              <tr>
                <td className="px-4 py-4 text-[#FF4444]" colSpan={5}>
                  Unable to load client records: {error.message}
                </td>
              </tr>
            ) : profileRows.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-zinc-400" colSpan={5}>
                  No client records available yet.
                </td>
              </tr>
            ) : (
              profileRows.map((profile) => (
                <tr key={profile.id} className="border-t border-white/10 text-zinc-200">
                  <td className="px-4 py-3">{profile.full_name ?? "-"}</td>
                  <td className="px-4 py-3">{profile.email}</td>
                  <td className="px-4 py-3">{profile.phone ?? "-"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs ${profile.is_admin ? "bg-[#FFD700]/20 text-[#FFD700]" : "bg-[#00AAFF]/20 text-[#8fdfff]"}`}>
                      {profile.is_admin ? "ADMIN" : "USER"}
                    </span>
                  </td>
                  <td className="px-4 py-3">{profile.created_at ? new Date(profile.created_at).toLocaleString() : "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}
