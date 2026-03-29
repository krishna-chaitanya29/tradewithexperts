import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function PostAuthPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const nextPath = params.next && params.next.startsWith("/") ? params.next : "/community";

  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  const fullNameFromMeta = ((user.user_metadata?.full_name as string | undefined) ?? "").trim();
  const phoneFromMeta = ((user.user_metadata?.phone as string | undefined) ?? "").trim();

  const { data: profile } = await client
    .from("profiles")
    .select("full_name, phone")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    await client.from("profiles").upsert(
      {
        id: user.id,
        email: user.email ?? "",
        full_name: fullNameFromMeta || null,
        phone: phoneFromMeta || null,
        created_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );
  }

  const fullName = (profile?.full_name ?? fullNameFromMeta ?? "").trim();
  const phone = (profile?.phone ?? phoneFromMeta ?? "").trim();
  const isComplete = Boolean(fullName) && Boolean(phone);

  if (!isComplete) {
    redirect(`/profile?next=${encodeURIComponent(nextPath)}`);
  }

  redirect(nextPath);
}
