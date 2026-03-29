import { getSiteSettings } from "@/lib/data";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const settings = await getSiteSettings();
  const notice = settings.find((entry) => entry.key === "notice_text")?.value ?? "Proof-first trading. Updates every day.";
  return NextResponse.json(
    { notice },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}
