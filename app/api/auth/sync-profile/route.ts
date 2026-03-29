import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  let payload: { fullName?: string; phone?: string } = {};
  try {
    payload = await request.json();
  } catch {
    payload = {};
  }

  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const userEmail = (user.email ?? "").toLowerCase();
  const adminEmails = (process.env.ADMIN_EMAILS ?? "junctionking29@gmail.com")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);

  try {
    const admin = createAdminClient();

    const { data: existingProfile } = await admin
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .maybeSingle();

    const { count } = await admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("is_admin", true);

    const isFirstAdmin = (count ?? 0) === 0;
    const shouldBeAdmin = Boolean(existingProfile?.is_admin) || adminEmails.includes(userEmail) || isFirstAdmin;

    const { error: upsertError } = await admin.from("profiles").upsert(
      {
        id: user.id,
        email: user.email ?? "",
        full_name: payload.fullName ?? ((user.user_metadata?.full_name as string | undefined) ?? null),
        phone: payload.phone ?? ((user.user_metadata?.phone as string | undefined) ?? null),
        is_admin: shouldBeAdmin,
        created_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );

    if (upsertError) {
      if (upsertError.code === "23505") {
        return NextResponse.json(
          { ok: false, error: "This phone number is already associated with another email address.", mode: "service_role" },
          { status: 409 },
        );
      }
      return NextResponse.json({ ok: false, error: upsertError.message, mode: "service_role" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, is_admin: shouldBeAdmin, mode: "service_role" });
  } catch {
    const shouldBeAdmin = adminEmails.includes(userEmail);
    const { error } = await client.from("profiles").upsert(
      {
        id: user.id,
        email: user.email ?? "",
        full_name: payload.fullName ?? ((user.user_metadata?.full_name as string | undefined) ?? null),
        phone: payload.phone ?? ((user.user_metadata?.phone as string | undefined) ?? null),
        is_admin: shouldBeAdmin,
        created_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { ok: false, error: "This phone number is already associated with another email address.", mode: "session_fallback" },
          { status: 409 },
        );
      }
      return NextResponse.json({ ok: false, error: error.message, mode: "session_fallback" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, is_admin: shouldBeAdmin, mode: "session_fallback" });
  }
}
