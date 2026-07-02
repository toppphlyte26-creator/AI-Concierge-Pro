import React from "react";
import { ChartCard } from "@/components/ChartCard";
import { CategoryDonut } from "@/components/CategoryDonut";
import { TrendChart } from "@/components/TrendChart";

export function DashboardChartsRow({ categoryBreakdown, trend, currency }) {
  return (
    <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartCard title="Spending by category" subtitle="This month" testId="dashboard-category-donut">
        <CategoryDonut data={categoryBreakdown} currency={currency} />
      </ChartCard>
      <ChartCard title="Income vs expense" subtitle="Last 6 months" testId="dashboard-trend-chart">
        <TrendChart data={trend} currency={currency} />
      </ChartCard>
    </div>
  );
}
