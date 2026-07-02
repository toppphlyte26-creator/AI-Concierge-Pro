import React from "react";
import { TrendingUp, TrendingDown, Wallet, Percent } from "lucide-react";
import { KPICard } from "@/components/KPICard";
import { netToneFromValue, savingsRateTone } from "@/lib/ui-status";

export function DashboardKpiRow({ kpis, currency }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <KPICard label="This month income" value={kpis.income} currency={currency}
        tone="positive" icon={TrendingUp} testId="dashboard-kpi-income" />
      <KPICard label="This month expenses" value={kpis.expense} currency={currency}
        tone="negative" icon={TrendingDown} testId="dashboard-kpi-expenses" />
      <KPICard label="Net" value={kpis.net} currency={currency}
        tone={netToneFromValue(kpis.net)} icon={Wallet} testId="dashboard-kpi-net" />
      <KPICard label="Savings rate" value={0} currency={currency}
        tone={savingsRateTone(kpis.savings_rate)}
        icon={Percent}
        testId="dashboard-kpi-savings-rate"
        delta={`${kpis.savings_rate.toFixed(1)}% of income saved`} />
    </div>
  );
}
