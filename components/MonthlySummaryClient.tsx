"use client";

import { useState } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type MonthlyItem = {
  month: string;
  totalCalls: number;
  wins: number;
  slHits: number;
  winRate: number;
  totalPoints: number;
  summaryText: string;
  chart: Array<{ day: number; value: number }>;
};

export function MonthlySummaryClient({ items }: { items: MonthlyItem[] }) {
  const [openMonth, setOpenMonth] = useState<string | null>(items[0]?.month ?? null);

  return (
    <div className="mt-8 space-y-4">
      {items.map((month) => {
        const open = openMonth === month.month;
        return (
          <section key={month.month} className="rounded-2xl border border-white/10 bg-[#111111] p-4">
            <button className="flex w-full items-center justify-between text-left" onClick={() => setOpenMonth(open ? null : month.month)}>
              <span className="font-heading text-xl text-white">{month.month}</span>
              <span className="text-sm text-zinc-400">{month.totalCalls} calls</span>
            </button>

            {open ? (
              <div className="mt-5 space-y-4">
                <div className="grid gap-3 md:grid-cols-3">
                  <p className="text-sm text-zinc-300">Wins: {month.wins}</p>
                  <p className="text-sm text-zinc-300">SL Hits: {month.slHits}</p>
                  <p className="text-sm text-zinc-300">Win Rate: {month.winRate.toFixed(1)}%</p>
                  <p className="text-sm text-zinc-300">Total Points: {month.totalPoints}</p>
                </div>
                <div className="prose prose-invert max-w-none text-sm text-zinc-300" dangerouslySetInnerHTML={{ __html: month.summaryText }} />
                <div className="h-56 w-full rounded-lg bg-[#1a1a1a] p-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={month.chart}>
                      <XAxis dataKey="day" stroke="#71717a" />
                      <YAxis stroke="#71717a" />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="#00AAFF" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
