"use client";

import { motion } from "framer-motion";
import useSWR from "swr";

type NoticeBarProps = {
  text: string;
};

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch notice");
  }
  return response.json();
};

export function NoticeBar({ text }: NoticeBarProps) {
  const { data } = useSWR("/api/settings/notice", fetcher, {
    refreshInterval: 60_000,
    fallbackData: { notice: text },
  });

  const displayText = data?.notice ?? text;

  return (
    <div className="fixed inset-x-0 top-0 z-50 overflow-hidden border-b border-[#FFD700]/20 bg-[#0b0b0b]">
      <motion.div
        className="whitespace-nowrap py-2 text-sm font-medium text-[#FFD700]"
        animate={{ x: ["100%", "-100%"] }}
        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 20, ease: "linear" }}
      >
        {displayText}
      </motion.div>
    </div>
  );
}
