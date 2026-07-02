import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ChartCard({ title, subtitle, actions, children, testId, className }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
      data-testid={testId}
      className={className}
    >
      <Card className="border-border bg-card/80 card-shadow">
        <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
          <div>
            <CardTitle className="font-display text-base">{title}</CardTitle>
            {subtitle ? <div className="text-xs text-muted-foreground mt-0.5">{subtitle}</div> : null}
          </div>
          {actions}
        </CardHeader>
        <CardContent className="pt-2">{children}</CardContent>
      </Card>
    </motion.div>
  );
}
