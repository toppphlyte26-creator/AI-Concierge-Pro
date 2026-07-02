import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Num } from "@/components/Num";
import { formatDate, daysUntil } from "@/lib/format";
import { billDueTone } from "@/lib/ui-status";

function DueBadge({ tone, days }) {
  if (tone === "soon") {
    return (
      <Badge variant="outline" className="mt-1 text-[10px] text-amber-400 border-amber-400/40">
        in {days}d
      </Badge>
    );
  }
  if (tone === "overdue") {
    return (
      <Badge variant="outline" className="mt-1 text-[10px] text-rose-400 border-rose-400/40">
        Overdue
      </Badge>
    );
  }
  return null;
}

export function BillsPanel({ bills }) {
  return (
    <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:0.3, delay:0.05}}>
      <Card className="bg-card/80 border-border card-shadow h-full">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="font-display font-semibold">Upcoming bills</div>
            <Link to="/app/bills" className="text-xs text-primary hover:underline" data-testid="dashboard-view-bills">Manage</Link>
          </div>
          <div className="mt-4 space-y-3" data-testid="dashboard-bills-list">
            {(bills || []).slice(0, 5).map((b) => {
              const days = daysUntil(b.next_due_date);
              const tone = billDueTone(days);
              return (
                <div key={b.id} className="flex items-center justify-between text-sm">
                  <div>
                    <div className="font-medium">{b.name}</div>
                    <div className="text-xs text-muted-foreground">{formatDate(b.next_due_date)} • {b.frequency}</div>
                  </div>
                  <div className="text-right">
                    <div className="num text-sm"><Num value={b.amount} currency={b.currency} /></div>
                    <DueBadge tone={tone} days={days} />
                  </div>
                </div>
              );
            })}
            {(!bills || bills.length === 0) && (
              <div className="text-xs text-muted-foreground">No bills in the next 30 days.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
