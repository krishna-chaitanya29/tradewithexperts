import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "");
}

export async function POST(request: Request) {
  try {
    const { email, phone } = (await request.json()) as { email?: string; phone?: string };
    const normalizedEmail = (email ?? "").trim().toLowerCase();
    const normalizedPhone = normalizePhone((phone ?? "").trim());

    if (!normalizedEmail || !normalizedPhone) {
      return NextResponse.json({ ok: false, error: "Email address and phone number are required." }, { status: 400 });
    }

    let admin;
    try {
      admin = createAdminClient();
    } catch {
      // If service role is not configured, skip pre-check and rely on DB constraint.
      return NextResponse.json({ ok: true, mode: "skip_no_service_role" });
    }

    const { data, error } = await admin.from("profiles").select("email, phone").not("phone", "is", null).limit(5000);
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    const duplicate = (data ?? []).find((row) => normalizePhone(row.phone ?? "") === normalizedPhone && (row.email ?? "").toLowerCase() !== normalizedEmail);
    if (duplicate) {
      return NextResponse.json(
        { ok: false, error: "This phone number is already associated with another email address." },
        { status: 409 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request payload." }, { status: 400 });
  }
}
