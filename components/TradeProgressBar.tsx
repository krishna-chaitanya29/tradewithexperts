type TradeProgressBarProps = {
  stopLoss: number;
  target: number;
  current?: number | null;
};

export function TradeProgressBar({ stopLoss, target, current }: TradeProgressBarProps) {
  const value = current ?? stopLoss;
  const range = target - stopLoss || 1;
  const pct = Math.min(100, Math.max(0, ((value - stopLoss) / range) * 100));

  return (
    <div>
      <div className="mb-2 flex justify-between text-xs text-zinc-400">
        <span>SL {stopLoss}</span>
        <span>Target {target}</span>
      </div>
      <div className="relative h-2 rounded-full bg-zinc-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#FF4444] via-[#00AAFF] to-[#00FF7F]"
          style={{ width: `${pct}%` }}
        />
        <div className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border border-white bg-[#FFD700]" style={{ left: `${pct}%` }} />
      </div>
    </div>
  );
}
