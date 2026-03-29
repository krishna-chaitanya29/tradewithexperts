import { ProfileForm } from "@/components/ProfileForm";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const user = await requireUser();
  const client = await createClient();

  const { data: profile } = await client
    .from("profiles")
    .select("full_name, phone")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10">
      <h1 className="font-heading text-4xl text-white">My Profile</h1>
      <p className="mt-2 text-zinc-400">Update your name and phone number. Each phone number can be linked to only one account.</p>

      <ProfileForm
        initialFullName={profile?.full_name ?? ((user.user_metadata?.full_name as string | undefined) ?? "")}
        initialPhone={profile?.phone ?? ((user.user_metadata?.phone as string | undefined) ?? "")}
      />
    </main>
  );
}
