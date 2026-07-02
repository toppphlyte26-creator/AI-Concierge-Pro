import React from "react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatCurrency, formatMonthLabel, formatCompact } from "@/lib/format";

export function TrendChart({ data, currency = "USD" }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[260px] flex items-center justify-center text-sm text-muted-foreground">
        Add transactions to see trends.
      </div>
    );
  }
  return (
    <div className="h-[280px] min-w-[240px]">
      <ResponsiveContainer width="100%" height="100%" minWidth={240} minHeight={240}>
        <BarChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="hsla(220, 18%, 26%, 0.55)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="month"
            tickFormatter={formatMonthLabel}
            stroke="hsla(210, 40%, 96%, 0.55)"
            style={{ fontFamily: 'IBM Plex Mono', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="hsla(210, 40%, 96%, 0.55)"
            tickFormatter={(v) => formatCompact(v, currency)}
            style={{ fontFamily: 'IBM Plex Mono', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={50}
          />
          <Tooltip
            cursor={{ fill: 'hsla(210, 40%, 96%, 0.04)' }}
            contentStyle={{
              background: 'hsla(222, 22%, 11%, 0.96)',
              border: '1px solid hsl(var(--border))',
              borderRadius: 10,
              fontFamily: 'IBM Plex Mono',
              fontSize: 12,
            }}
            formatter={(v, name) => [formatCurrency(v, currency), name === 'income' ? 'Income' : 'Expense']}
            labelFormatter={(v) => formatMonthLabel(v)}
          />
          <Legend wrapperStyle={{ fontSize: 11, color: 'hsl(var(--muted-foreground))' }} />
          <Bar dataKey="income" name="Income" fill="hsl(var(--chart-4))" radius={[6, 6, 0, 0]} />
          <Bar dataKey="expense" name="Expense" fill="hsl(var(--chart-5))" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
