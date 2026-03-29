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

  const { path } = await request.json();
  const filePath = String(path ?? "");

  if (!filePath) {
    return NextResponse.json({ error: "Missing file path" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin.storage.from(BUCKET).createSignedUrl(filePath, 60 * 60 * 24 * 7);

  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: "Unable to sign file URL" }, { status: 500 });
  }

  return NextResponse.json({ url: data.signedUrl });
}
