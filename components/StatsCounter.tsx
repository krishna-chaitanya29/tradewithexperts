"use client";

import { useEffect, useRef, useState } from "react";

type StatsCounterProps = {
  label: string;
  value: number;
  suffix?: string;
};

export function StatsCounter({ label, value, suffix = "" }: StatsCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const target = containerRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        const duration = 900;
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          setDisplayValue(Math.round(value * progress));
          if (progress < 1) {
            requestAnimationFrame(tick);
          }
        };

        requestAnimationFrame(tick);
        observer.disconnect();
      },
      { threshold: 0.2 },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={containerRef} className="rounded-xl border border-white/10 bg-[#111111] p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-zinc-400">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-white">
        {displayValue}
        {suffix}
      </p>
    </div>
  );
}
