import { createClient } from "@/lib/supabase/server";
import { redirect, unauthorized } from "next/navigation";

export async function getUser() {
  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  return user;
}

export async function requireUser() {
  const user = await getUser();
  if (!user) {
    redirect("/login?next=/community/links");
  }
  return user;
}

export async function requireUser401() {
  const user = await getUser();
  if (!user) {
    unauthorized();
  }
  return user;
}

export async function requireAdmin() {
  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data } = await client
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);

  const allowByEmail = adminEmails.includes((user.email ?? "").toLowerCase());

  if (!data?.is_admin && !allowByEmail) {
    redirect("/");
  }

  return user;
}
