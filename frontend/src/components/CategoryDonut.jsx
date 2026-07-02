import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { categoryColor } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";

export function CategoryDonut({ data, currency = "USD" }) {
  const total = (data || []).reduce((s, d) => s + (d.amount || 0), 0);
  if (!data || data.length === 0) {
    return (
      <div className="h-[260px] flex items-center justify-center text-sm text-muted-foreground">
        No expenses yet this month.
      </div>
    );
  }
  return (
    <div className="h-[280px] relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            innerRadius={70}
            outerRadius={100}
            paddingAngle={2}
            dataKey="amount"
            nameKey="category"
            stroke="hsl(var(--card))"
            strokeWidth={2}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={categoryColor(entry.category)} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "hsla(222, 22%, 11%, 0.96)",
              border: "1px solid hsl(var(--border))",
              borderRadius: 10,
              fontFamily: 'IBM Plex Mono',
              fontSize: 12,
            }}
            formatter={(v, name) => [formatCurrency(v, currency), name]}
          />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            wrapperStyle={{ fontSize: 11, color: 'hsl(var(--muted-foreground))' }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ top: '-20px' }}>
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Total</div>
        <div className="num text-xl font-semibold">{formatCurrency(total, currency)}</div>
      </div>
    </div>
  );
}
