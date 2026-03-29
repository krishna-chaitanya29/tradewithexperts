import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "");
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { fullName?: string; phone?: string };
    const fullName = (payload.fullName ?? "").trim();
    const phone = (payload.phone ?? "").trim();

    if (!fullName || !phone) {
      return NextResponse.json({ ok: false, error: "Full name and phone number are required." }, { status: 400 });
    }

    const normalizedPhone = normalizePhone(phone);
    if (normalizedPhone.length < 8) {
      return NextResponse.json({ ok: false, error: "Please enter a valid phone number." }, { status: 400 });
    }

    const client = await createClient();
    const {
      data: { user },
    } = await client.auth.getUser();

    if (!user) {
      return NextResponse.json({ ok: false, error: "Authentication required." }, { status: 401 });
    }

    const { error } = await client.from("profiles").upsert(
      {
        id: user.id,
        email: user.email ?? "",
        full_name: fullName,
        phone,
        created_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { ok: false, error: "This phone number is already associated with another email address." },
          { status: 409 },
        );
      }
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request payload." }, { status: 400 });
  }
}
