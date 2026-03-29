"use client";

import { isMarketOpenIST } from "@/lib/market";
import { useEffect, useState } from "react";

export function MarketStatusBadge() {
  const [open, setOpen] = useState(() => isMarketOpenIST());

  useEffect(() => {
    const id = window.setInterval(() => setOpen(isMarketOpenIST()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <span className={`rounded-full px-3 py-1 text-xs ${open ? "bg-[#00FF7F]/20 text-[#00FF7F]" : "bg-zinc-700 text-zinc-300"}`}>
      {open ? "Market Open" : "Market Closed"}
    </span>
  );
}
