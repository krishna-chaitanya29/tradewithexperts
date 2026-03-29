import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const BUCKET = "trade-screenshots";

async function isAdmin() {
  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return false;
  }

  const { data } = await client.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  return Boolean(data?.is_admin);
}

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { fileName } = await request.json();
  const sanitized = String(fileName ?? "proof.png").replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `screens/${Date.now()}-${sanitized}`;

  const admin = createAdminClient();
  const { data, error } = await admin.storage.from(BUCKET).createSignedUploadUrl(path);

  if (error || !data) {
    return NextResponse.json({ error: "Unable to create upload URL" }, { status: 500 });
  }

  return NextResponse.json({ path: data.path, token: data.token });
}
