import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

type RegisterPayload = {
  email?: string;
  password?: string;
  fullName?: string;
  phone?: string;
};

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "");
}

export async function POST(request: Request) {
  let payload: RegisterPayload;
  try {
    payload = (await request.json()) as RegisterPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request payload." }, { status: 400 });
  }

  const email = (payload.email ?? "").trim().toLowerCase();
  const password = (payload.password ?? "").trim();
  const fullName = (payload.fullName ?? "").trim();
  const phone = (payload.phone ?? "").trim();
  const normalizedPhone = normalizePhone(phone);

  if (!email || !password || !fullName || !phone) {
    return NextResponse.json({ ok: false, error: "Email, password, full name, and phone number are required." }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ ok: false, error: "Password must contain at least 6 characters." }, { status: 400 });
  }

  if (normalizedPhone.length < 8 || normalizedPhone.length > 15) {
    return NextResponse.json({ ok: false, error: "Please enter a valid phone number." }, { status: 400 });
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "Direct registration is unavailable because SUPABASE_SERVICE_ROLE_KEY is missing.",
      },
      { status: 500 },
    );
  }

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      phone,
    },
  });

  if (createError) {
    return NextResponse.json({ ok: false, error: createError.message }, { status: 400 });
  }

  const userId = created.user?.id;
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Failed to create account." }, { status: 500 });
  }

  const { error: profileError } = await admin.from("profiles").upsert(
    {
      id: userId,
      email,
      full_name: fullName,
      phone,
      created_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  if (profileError) {
    if (profileError.code === "23505") {
      return NextResponse.json(
        { ok: false, error: "This phone number is already associated with another email address." },
        { status: 409 },
      );
    }

    return NextResponse.json({ ok: false, error: profileError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
