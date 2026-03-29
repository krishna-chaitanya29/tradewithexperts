"use client";

import { useState } from "react";

type ApplyLiveTemplateButtonProps = {
  instrumentFieldName: string;
  sideFieldName: string;
  entryFieldName: string;
  targetFieldName: string;
  stopFieldName: string;
  templates?: Record<string, { target: number; stop: number }>;
  currentFieldName?: string;
  className?: string;
};

const TEMPLATE_POINTS: Record<string, { target: number; stop: number }> = {
  NIFTY50: { target: 60, stop: 35 },
  BANKNIFTY: { target: 150, stop: 90 },
  FINNIFTY: { target: 45, stop: 25 },
};

function getValue(form: HTMLFormElement, name: string) {
  const element = form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | null;
  return element?.value ?? "";
}

function setValue(form: HTMLFormElement, name: string, value: number) {
  const element = form.elements.namedItem(name) as HTMLInputElement | null;
  if (!element) return;
  element.value = String(Math.round(value * 100) / 100);
  element.dispatchEvent(new Event("input", { bubbles: true }));
}

export function ApplyLiveTemplateButton({
  instrumentFieldName,
  sideFieldName,
  entryFieldName,
  targetFieldName,
  stopFieldName,
  templates,
  currentFieldName,
  className,
}: ApplyLiveTemplateButtonProps) {
  const [status, setStatus] = useState("");

  const applyTemplate = (button: HTMLButtonElement) => {
    const form = button.closest("form") as HTMLFormElement | null;
    if (!form) {
      setStatus("Unable to locate the form.");
      return;
    }

    const instrument = getValue(form, instrumentFieldName) || "NIFTY50";
    const side = (getValue(form, sideFieldName) || "BUY").toUpperCase();
    const entryRaw = getValue(form, entryFieldName).trim();
    const entry = Number(entryRaw);

    if (!Number.isFinite(entry)) {
      setStatus("Enter a valid entry price first.");
      return;
    }

    const templateSource = templates ?? TEMPLATE_POINTS;
    const template = templateSource[instrument] ?? templateSource.NIFTY50 ?? TEMPLATE_POINTS.NIFTY50;
    const target = side === "SELL" ? entry - template.target : entry + template.target;
    const stop = side === "SELL" ? entry + template.stop : entry - template.stop;

    setValue(form, targetFieldName, target);
    setValue(form, stopFieldName, stop);
    if (currentFieldName) {
      setValue(form, currentFieldName, entry);
    }

    setStatus(`Applied ${instrument} template (Target: ${template.target}, Stop-Loss: ${template.stop}).`);
  };

  return (
    <div className={className}>
      <button
        type="button"
        onClick={(event) => applyTemplate(event.currentTarget)}
        className="rounded border border-[#FFD700]/50 bg-[#FFD700]/10 px-3 py-1 text-xs font-semibold text-[#FFD700]"
      >
        Apply Instrument Template
      </button>
      {status ? <p className="mt-1 text-xs text-zinc-400">{status}</p> : null}
    </div>
  );
}
