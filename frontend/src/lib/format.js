// Currency + date formatting helpers.

const SYMBOLS = { USD: "$", EUR: "\u20ac", GBP: "\u00a3", INR: "\u20b9", JPY: "\u00a5" };

function pickSign(num, showPlus) {
  if (num < 0) return "-";
  if (showPlus) return "+";
  return "";
}

export function formatCurrency(amount, currency = "USD", opts = {}) {
  const sym = SYMBOLS[currency] || "";
  const num = Number(amount) || 0;
  const abs = Math.abs(num);
  const digits = currency === "JPY" ? 0 : 2;
  const str = abs.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
  return `${pickSign(num, opts.showPlus)}${sym}${str}`;
}

function compactSuffix(abs) {
  if (abs >= 1_000_000) return { div: 1_000_000, suffix: "M" };
  if (abs >= 1_000) return { div: 1_000, suffix: "k" };
  return { div: 1, suffix: "" };
}

export function formatCompact(amount, currency = "USD") {
  const sym = SYMBOLS[currency] || "";
  const num = Number(amount) || 0;
  const abs = Math.abs(num);
  const { div, suffix } = compactSuffix(abs);
  const decimals = suffix === "" ? 0 : 1;
  const s = (num / div).toFixed(decimals) + suffix;
  return `${sym}${s}`;
}

export function formatDate(dateStr) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function formatMonthLabel(ym) {
  if (!ym) return "";
  const [y, m] = ym.split("-");
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleDateString("en-US", { month: "short" });
}

export function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function daysUntil(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return Math.round((d - now) / (1000 * 60 * 60 * 24));
}
