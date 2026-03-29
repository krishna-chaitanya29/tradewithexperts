import { CommunityLinksClient } from "@/components/CommunityLinksClient";
import { requireUser } from "@/lib/auth";
import { getSiteSettings } from "@/lib/data";

function getSetting(settings: { key: string; value: string }[], key: string, fallback: string) {
  return settings.find((item) => item.key === key)?.value ?? fallback;
}

export default async function CommunityLinksPage() {
  await requireUser();
  const settings = await getSiteSettings();
  const telegram = getSetting(settings, "telegram_url", "https://t.me/example");
  const whatsapp = getSetting(settings, "whatsapp_url", "https://chat.whatsapp.com/example");

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="font-heading text-4xl text-white">Community Access</h1>
      <p className="mt-2 text-zinc-400">Use the links below to join our official free trading communities.</p>
      <CommunityLinksClient telegram={telegram} whatsapp={whatsapp} />
    </main>
  );
}
