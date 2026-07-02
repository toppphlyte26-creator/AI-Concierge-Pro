import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Num } from "@/components/Num";

export function KPICard({ label, value, currency = "USD", tone = "neutral", icon: Icon, testId, delta }) {
  const toneClasses = {
    neutral: "text-foreground",
    positive: "text-emerald-400",
    negative: "text-rose-400",
    accent: "text-primary",
  }[tone] || "text-foreground";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -1 }}
      data-testid={testId}
    >
      <Card className="noise-overlay card-shadow border-border bg-card/80 overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
              {label}
            </div>
            {Icon ? (
              <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Icon className="h-4 w-4" />
              </div>
            ) : null}
          </div>
          <div className={cn("mt-3 num text-3xl font-semibold tracking-tight", toneClasses)}>
            <Num value={value} currency={currency} />
          </div>
          {delta ? (
            <div className="mt-2 text-xs text-muted-foreground">{delta}</div>
          ) : null}
        </CardContent>
      </Card>
    </motion.div>
  );
}
