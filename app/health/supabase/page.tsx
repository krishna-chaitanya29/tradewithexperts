import { createClient } from "@/lib/supabase/server";

type CheckResult = {
  name: string;
  ok: boolean;
  detail: string;
};

const REQUIRED_TABLES = [
  "profiles",
  "trades",
  "monthly_summaries",
  "site_settings",
  "content_blocks",
  "daily_analysis",
  "live_trades",
  "trade_reactions",
] as const;

async function checkTableExists(client: Awaited<ReturnType<typeof createClient>>, table: string): Promise<CheckResult> {
  try {
    const { error } = await client.from(table).select("*", { count: "exact", head: true });

    if (!error) {
      return {
        name: `table:${table}`,
        ok: true,
        detail: "reachable",
      };
    }

    // Supabase/PostgREST uses PGRST205 for missing table in schema cache.
    const missing = (error as { code?: string }).code === "PGRST205";
    return {
      name: `table:${table}`,
      ok: !missing,
      detail: missing ? "missing" : error.message,
    };
  } catch (err) {
    return {
      name: `table:${table}`,
      ok: false,
      detail: err instanceof Error ? err.message : "unknown error",
    };
  }
}

export const dynamic = "force-dynamic";

export default async function SupabaseHealthPage() {
  const checks: CheckResult[] = [];

  const envChecks: CheckResult[] = [
    {
      name: "env:NEXT_PUBLIC_SUPABASE_URL",
      ok: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      detail: process.env.NEXT_PUBLIC_SUPABASE_URL ? "set" : "missing",
    },
    {
      name: "env:NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY|NEXT_PUBLIC_SUPABASE_ANON_KEY",
      ok: Boolean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      detail:
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
          ? "set"
          : "missing",
    },
    {
      name: "env:SUPABASE_SERVICE_ROLE_KEY",
      ok: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      detail: process.env.SUPABASE_SERVICE_ROLE_KEY ? "set" : "missing",
    },
    {
      name: "env:ADMIN_EMAILS",
      ok: Boolean(process.env.ADMIN_EMAILS),
      detail: process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS : "missing",
    },
  ];

  checks.push(...envChecks);

  let userEmail = "not logged in";
  let userId = "-";
  let isAdmin = false;

  try {
    const client = await createClient();
    const {
      data: { user },
      error: userError,
    } = await client.auth.getUser();

    if (userError) {
      checks.push({
        name: "auth:getUser",
        ok: false,
        detail: userError.message,
      });
    } else {
      checks.push({
        name: "auth:getUser",
        ok: true,
        detail: user ? "session found" : "no active session",
      });
    }

    if (user) {
      userEmail = user.email ?? "unknown";
      userId = user.id;

      const profileQuery = await client.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
      if (profileQuery.error) {
        checks.push({
          name: "profile:lookup",
          ok: false,
          detail: profileQuery.error.message,
        });
      } else {
        isAdmin = Boolean(profileQuery.data?.is_admin);
        checks.push({
          name: "profile:lookup",
          ok: true,
          detail: `is_admin=${String(isAdmin)}`,
        });
      }
    }

    const tableChecks = await Promise.all(REQUIRED_TABLES.map((table) => checkTableExists(client, table)));
    checks.push(...tableChecks);
  } catch (err) {
    checks.push({
      name: "supabase:client",
      ok: false,
      detail: err instanceof Error ? err.message : "failed to create client",
    });
  }

  const passed = checks.filter((check) => check.ok).length;
  const failed = checks.length - passed;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <h1 className="font-heading text-4xl text-white">Supabase Health Check</h1>
      <p className="mt-2 text-zinc-400">Use this page to verify environment setup, schema creation, and admin role status.</p>

      <section className="mt-6 rounded-xl border border-white/10 bg-[#111111] p-4">
        <p className="text-sm text-zinc-300">Checks: {checks.length}</p>
        <p className="text-sm text-[#00FF7F]">Passed: {passed}</p>
        <p className="text-sm text-[#FF4444]">Failed: {failed}</p>
      </section>

      <section className="mt-4 rounded-xl border border-white/10 bg-[#111111] p-4">
        <h2 className="font-heading text-xl text-white">Current Session</h2>
        <p className="mt-2 text-sm text-zinc-300">Email: {userEmail}</p>
        <p className="text-sm text-zinc-300">User ID: {userId}</p>
        <p className="text-sm text-zinc-300">Admin Role: {isAdmin ? "true" : "false"}</p>
      </section>

      <section className="mt-4 rounded-xl border border-white/10 bg-[#111111] p-4">
        <h2 className="font-heading text-xl text-white">Check Results</h2>
        <div className="mt-3 space-y-2">
          {checks.map((check) => (
            <div key={check.name} className="flex items-start justify-between gap-3 rounded-lg border border-white/10 bg-[#0f0f0f] p-3">
              <div>
                <p className="text-sm text-white">{check.name}</p>
                <p className="text-xs text-zinc-400">{check.detail}</p>
              </div>
              <span className={`rounded-full px-2 py-1 text-xs ${check.ok ? "bg-[#00FF7F]/20 text-[#00FF7F]" : "bg-[#FF4444]/20 text-[#FF4444]"}`}>
                {check.ok ? "OK" : "FAIL"}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-4 rounded-xl border border-white/10 bg-[#111111] p-4">
        <h2 className="font-heading text-xl text-white">If Tables Are Missing</h2>
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-zinc-300">
          <li>Open Supabase SQL Editor.</li>
          <li>Run the full SQL from supabase/schema.sql.</li>
          <li>Reload this page and verify all table checks are OK.</li>
        </ol>
      </section>
    </main>
  );
}
