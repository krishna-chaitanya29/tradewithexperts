"use client";

import { GripVertical } from "lucide-react";
import { useMemo, useState } from "react";

const ALL_SECTIONS = [
  "announcements",
  "alerts",
  "todays-trades",
  "about",
  "community-cta",
  "all-pages",
] as const;

const LABELS: Record<(typeof ALL_SECTIONS)[number], string> = {
  announcements: "Announcements Bar",
  alerts: "Alerts & Offers",
  "todays-trades": "Today's Trades",
  about: "About + How We Trade",
  "community-cta": "Community CTA",
  "all-pages": "Explore All Pages",
};

type HomeSectionOrderEditorProps = {
  name: string;
  defaultValue: string;
};

export function HomeSectionOrderEditor({ name, defaultValue }: HomeSectionOrderEditorProps) {
  const initialOrder = useMemo(() => {
    const parsed = defaultValue
      .split(",")
      .map((entry) => entry.trim())
      .filter((entry): entry is (typeof ALL_SECTIONS)[number] =>
        (ALL_SECTIONS as readonly string[]).includes(entry),
      );

    const unique = parsed.filter((entry, idx) => parsed.indexOf(entry) === idx);
    const missing = ALL_SECTIONS.filter((entry) => !unique.includes(entry));
    return [...unique, ...missing];
  }, [defaultValue]);

  const [order, setOrder] = useState<(typeof ALL_SECTIONS)[number][]>(initialOrder);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const move = (from: number, to: number) => {
    if (from === to || to < 0 || to >= order.length) {
      return;
    }

    const next = [...order];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setOrder(next);
  };

  return (
    <div className="space-y-3">
      <input type="hidden" name={name} value={order.join(",")} />

      <div className="space-y-2">
        {order.map((item, index) => (
          <div
            key={item}
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => {
              if (dragIndex !== null) {
                move(dragIndex, index);
              }
              setDragIndex(null);
            }}
            onDragEnd={() => setDragIndex(null)}
            className="flex items-center justify-between rounded-lg border border-white/10 bg-[#0f0f0f] p-3"
          >
            <div className="flex items-center gap-3">
              <GripVertical size={16} className="text-zinc-500" />
              <div>
                <p className="text-sm text-white">{LABELS[item]}</p>
                <p className="text-xs text-zinc-500">{item}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => move(index, index - 1)}
                className="rounded border border-white/20 px-2 py-1 text-xs text-zinc-300"
              >
                Up
              </button>
              <button
                type="button"
                onClick={() => move(index, index + 1)}
                className="rounded border border-white/20 px-2 py-1 text-xs text-zinc-300"
              >
                Down
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
