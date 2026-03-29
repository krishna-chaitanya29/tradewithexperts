"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const TABLES = ["live_trades", "trade_reactions", "daily_analysis", "site_settings", "trades", "monthly_summaries", "content_blocks"];

export function AdminRealtimeRefresh() {
  const router = useRouter();
  const [updatedAt, setUpdatedAt] = useState<string>("");

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel("admin-realtime");

    for (const table of TABLES) {
      channel.on("postgres_changes", { event: "*", schema: "public", table }, () => {
        setUpdatedAt(new Date().toLocaleTimeString());
        router.refresh();
      });
    }

    channel.subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [router]);

  return <p className="text-xs text-zinc-500">Realtime sync {updatedAt ? `active - last update ${updatedAt}` : "active"}</p>;
}
