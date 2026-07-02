import React from "react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";

/**
 * Currency number rendered with monospaced tabular figures.
 * Use everywhere financial data is displayed.
 */
export function Num({ value, currency = "USD", showPlus = false, className, ...rest }) {
  return (
    <span className={cn("num", className)} {...rest}>
      {formatCurrency(value, currency, { showPlus })}
    </span>
  );
}
