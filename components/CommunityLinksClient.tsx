"use client";

import { trackEvent } from "@/lib/analytics";

type CommunityLinksClientProps = {
  telegram: string;
  whatsapp: string;
};

export function CommunityLinksClient({ telegram, whatsapp }: CommunityLinksClientProps) {
  return (
    <div className="mt-8 grid gap-4">
      <a
        href={telegram}
        target="_blank"
        rel="noreferrer"
        className="rounded-xl border border-white/10 bg-[#111111] p-5 text-white"
        onClick={() => trackEvent("community_link_clicked", { channel: "telegram" })}
      >
        Telegram Group
      </a>
      <a
        href={whatsapp}
        target="_blank"
        rel="noreferrer"
        className="rounded-xl border border-white/10 bg-[#111111] p-5 text-white"
        onClick={() => trackEvent("community_link_clicked", { channel: "whatsapp" })}
      >
        WhatsApp Group
      </a>
    </div>
  );
}
