// Small helpers used by pages to decide UI variants without nested ternaries.

export function budgetStatus(percent) {
  if (percent > 100) return "over";
  if (percent > 80) return "near";
  return "ok";
}

export function progressToneClass(percent) {
  const s = budgetStatus(percent);
  if (s === "over") return "bg-destructive/20";
  if (s === "near") return "bg-amber-500/20";
  return "";
}

export function billDueTone(days) {
  if (days === null || days === undefined) return "none";
  if (days < 0) return "overdue";
  if (days <= 7) return "soon";
  return "ok";
}

export function txAmountToneClass(type) {
  return type === "income" ? "text-emerald-400" : "";
}

export function txTypeBadgeClass(type) {
  return type === "income"
    ? "text-emerald-400 border-emerald-400/40"
    : "text-rose-400 border-rose-400/40";
}

export function netToneFromValue(value) {
  if (value >= 0) return "accent";
  return "negative";
}

export function savingsRateTone(rate) {
  if (rate >= 0) return "positive";
  return "negative";
}
