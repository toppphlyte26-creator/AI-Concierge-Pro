import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { Num } from "@/components/Num";
import { categoryColor } from "@/lib/constants";
import { progressToneClass } from "@/lib/ui-status";

export function BudgetsPanel({ budgets, currency }) {
  return (
    <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:0.3}}>
      <Card className="bg-card/80 border-border card-shadow">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="font-display font-semibold">Budgets</div>
            <Link to="/app/budgets" className="text-xs text-primary hover:underline" data-testid="dashboard-view-budgets">View all</Link>
          </div>
          <div className="mt-4 space-y-3" data-testid="dashboard-budgets-list">
            {(budgets || []).slice(0, 5).map((b) => (
              <div key={b.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ background: categoryColor(b.category) }} />
                    <span>{b.category}</span>
                  </div>
                  <div className="num text-xs text-muted-foreground">
                    <Num value={b.spent} currency={currency} /> / <Num value={b.limit} currency={currency} />
                  </div>
                </div>
                <Progress value={Math.min(b.percent, 100)} className={progressToneClass(b.percent)} />
              </div>
            ))}
            {(!budgets || budgets.length === 0) && (
              <div className="text-xs text-muted-foreground">No budgets set for this month.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
