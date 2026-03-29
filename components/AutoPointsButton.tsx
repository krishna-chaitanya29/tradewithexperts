"use client";

import { useState } from "react";

type AutoPointsButtonProps = {
  pointsFieldName: string;
  entryFieldName: string;
  stopFieldName: string;
  sideFieldName: string;
  outcomeFieldName: string;
  hitOutcomeValue: string;
  slOutcomeValue: string;
  targetFieldNames: string[];
  achievedTargetFieldName?: string;
  currentPriceFieldName?: string;
  className?: string;
};

function parseNumeric(form: HTMLFormElement, fieldName: string) {
  const element = form.elements.namedItem(fieldName) as HTMLInputElement | null;
  if (!element) return null;
  const raw = element.value.trim();
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseText(form: HTMLFormElement, fieldName: string) {
  const element = form.elements.namedItem(fieldName) as HTMLInputElement | HTMLSelectElement | null;
  return element?.value ?? "";
}

export function AutoPointsButton({
  pointsFieldName,
  entryFieldName,
  stopFieldName,
  sideFieldName,
  outcomeFieldName,
  hitOutcomeValue,
  slOutcomeValue,
  targetFieldNames,
  achievedTargetFieldName,
  currentPriceFieldName,
  className,
}: AutoPointsButtonProps) {
  const [status, setStatus] = useState("");

  const calculate = (button: HTMLButtonElement) => {
    const form = button.closest("form") as HTMLFormElement | null;
    if (!form) {
      setStatus("Unable to locate the form.");
      return;
    }

    const pointsInput = form.elements.namedItem(pointsFieldName) as HTMLInputElement | null;
    if (!pointsInput) {
      setStatus("Points field is missing.");
      return;
    }

    const entry = parseNumeric(form, entryFieldName);
    const stop = parseNumeric(form, stopFieldName);
    const side = parseText(form, sideFieldName).toUpperCase();
    const outcome = parseText(form, outcomeFieldName);

    if (entry == null) {
      setStatus("Enter a valid entry price first.");
      return;
    }

    const targetValues = targetFieldNames
      .map((fieldName) => ({ fieldName, value: parseNumeric(form, fieldName) }))
      .filter((item): item is { fieldName: string; value: number } => item.value != null);

    let chosenTarget: number | null = null;
    if (achievedTargetFieldName) {
      const selectedField = parseText(form, achievedTargetFieldName);
      const selectedValue = selectedField ? parseNumeric(form, selectedField) : null;
      chosenTarget = selectedValue ?? null;
    }
    if (chosenTarget == null && targetValues.length > 0) {
      chosenTarget = targetValues[0].value;
    }

    const currentPrice = currentPriceFieldName ? parseNumeric(form, currentPriceFieldName) : null;

    let points: number | null = null;
    if (outcome === hitOutcomeValue && chosenTarget != null) {
      points = side === "SELL" ? entry - chosenTarget : chosenTarget - entry;
    } else if (outcome === slOutcomeValue && stop != null) {
      points = side === "SELL" ? entry - stop : stop - entry;
    } else if (currentPrice != null) {
      points = side === "SELL" ? entry - currentPrice : currentPrice - entry;
    }

    if (points == null) {
      setStatus("Select a valid outcome and target to auto-calculate points.");
      return;
    }

    const normalized = Math.round(points * 100) / 100;
    pointsInput.value = String(normalized);
    pointsInput.dispatchEvent(new Event("input", { bubbles: true }));
    setStatus(`Points calculated: ${normalized}`);
  };

  return (
    <div className={className}>
      <button
        type="button"
        onClick={(event) => calculate(event.currentTarget)}
        className="rounded border border-[#00AAFF]/50 bg-[#00AAFF]/10 px-3 py-1 text-xs font-semibold text-[#8fdfff]"
      >
        Auto-Calc Points
      </button>
      {status ? <p className="mt-1 text-xs text-zinc-400">{status}</p> : null}
    </div>
  );
}
