import type { MessageType } from "@/lib/types";

const styleMap: Record<MessageType, string> = {
  info: "border-[#00AAFF]/40 bg-[#00AAFF]/10 text-[#9ddfff]",
  success: "border-[#FFD700]/40 bg-[#FFD700]/10 text-[#ffe98d]",
  warning: "border-[#ffaa33]/40 bg-[#ffaa33]/10 text-[#ffcf87]",
  celebration: "border-[#00FF7F]/40 bg-[#00FF7F]/10 text-[#9effcf]",
};

export function OutcomeMessage({ message, type = "info" }: { message: string; type?: MessageType }) {
  return <div className={`rounded-xl border p-3 text-sm ${styleMap[type]}`}>{message}</div>;
}
