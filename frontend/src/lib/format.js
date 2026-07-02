// Currency + date formatting helpers.

const SYMBOLS = { USD: "$", EUR: "\u20ac", GBP: "\u00a3", INR: "\u20b9", JPY: "\u00a5" };

export function formatCurrency(amount, currency = "USD", opts = {}) {
  const sym = SYMBOLS[currency] || "";
  const abs = Math.abs(Number(amount) || 0);
  const digits = currency === "JPY" ? 0 : 2;
  const str = abs.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
  const sign = (Number(amount) || 0) < 0 ? "-" : opts.showPlus ? "+" : "";
  return `${sign}${sym}${str}`;
}

export function formatCompact(amount, currency = "USD") {
  const sym = SYMBOLS[currency] || "";
  const num = Number(amount) || 0;
  const abs = Math.abs(num);
  let s;
  if (abs >= 1_000_000) s = (num / 1_000_000).toFixed(1) + "M";
  else if (abs >= 1_000) s = (num / 1_000).toFixed(1) + "k";
  else s = num.toFixed(0);
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
  // ym = "YYYY-MM"
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
