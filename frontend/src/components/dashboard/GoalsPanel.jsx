import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { Num } from "@/components/Num";

export function GoalsPanel({ goals }) {
  return (
    <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:0.3, delay:0.1}}>
      <Card className="bg-card/80 border-border card-shadow h-full">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="font-display font-semibold">Savings goals</div>
            <Link to="/app/goals" className="text-xs text-primary hover:underline" data-testid="dashboard-view-goals">Manage</Link>
          </div>
          <div className="mt-4 space-y-4" data-testid="dashboard-goals-list">
            {(goals || []).slice(0, 3).map((g) => {
              const pct = Math.min((g.current_amount / g.target_amount) * 100, 100);
              return (
                <div key={g.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="font-medium">{g.name}</div>
                    <div className="num text-xs text-muted-foreground">
                      <Num value={g.current_amount} currency={g.currency} /> / <Num value={g.target_amount} currency={g.currency} />
                    </div>
                  </div>
                  <Progress value={pct} />
                </div>
              );
            })}
            {(!goals || goals.length === 0) && (
              <div className="text-xs text-muted-foreground">No goals yet.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
