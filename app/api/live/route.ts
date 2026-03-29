import { getLivePageData, getTrades } from "@/lib/data";
import { NextResponse } from "next/server";

export async function GET() {
  const live = await getLivePageData();
  const historicalTrades = await getTrades();

  return NextResponse.json({
    ...live,
    trades: live.trades.length ? live.trades : historicalTrades,
  });
}
