"use client";

import { useEffect, useState } from "react";

export function ConfettiBurst() {
  const [active, setActive] = useState(true);

  useEffect(() => {
    const id = window.setTimeout(() => setActive(false), 1500);
    return () => window.clearTimeout(id);
  }, []);

  if (!active) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 16 }).map((_, idx) => (
        <span
          key={idx}
          className="absolute h-2 w-2 animate-[confetti_1.5s_ease-out_forwards] rounded-sm bg-[#FFD700]"
          style={{ left: `${(idx + 1) * 5}%`, top: "20%", animationDelay: `${idx * 40}ms` }}
        />
      ))}
    </div>
  );
}
