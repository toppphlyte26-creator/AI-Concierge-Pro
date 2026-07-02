import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Percent,
  Plus,
  ScanLine,
  ArrowRight,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { KPICard } from "@/components/KPICard";
import { ChartCard } from "@/components/ChartCard";
import { CategoryDonut } from "@/components/CategoryDonut";
import { TrendChart } from "@/components/TrendChart";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { formatCurrency, formatDate, daysUntil } from "@/lib/format";
import { Num } from "@/components/Num";
import { categoryColor } from "@/lib/constants";
import { TransactionModal } from "@/components/TransactionModal";

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/dashboard");
      setData(data);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const ccy = data?.base_currency || "USD";

  const actions = (
    <div className="hidden md:flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={() => navigate("/app/receipt")} data-testid="dashboard-scan-receipt-button" className="gap-1.5">
        <ScanLine className="h-4 w-4" /> Scan receipt
      </Button>
      <Button size="sm" onClick={() => setModalOpen(true)} data-testid="dashboard-add-transaction-button" className="gap-1.5">
        <Plus className="h-4 w-4" /> Add transaction
      </Button>
    </div>
  );

  return (
    <AppShell title="Dashboard" actions={actions}>
      {loading || !data ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[0,1,2,3].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <KPICard label="This month income" value={data.kpis.income} currency={ccy} tone="positive" icon={TrendingUp} testId="dashboard-kpi-income" />
            <KPICard label="This month expenses" value={data.kpis.expense} currency={ccy} tone="negative" icon={TrendingDown} testId="dashboard-kpi-expenses" />
            <KPICard label="Net" value={data.kpis.net} currency={ccy} tone={data.kpis.net >= 0 ? "accent" : "negative"} icon={Wallet} testId="dashboard-kpi-net" />
            <KPICard label="Savings rate" value={0} currency={ccy}
              tone={data.kpis.savings_rate >= 0 ? "positive" : "negative"}
              icon={Percent}
              testId="dashboard-kpi-savings-rate"
              delta={`${data.kpis.savings_rate.toFixed(1)}% of income saved`}
            />
          </div>

          {/* Main charts row */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Spending by category" subtitle="This month" testId="dashboard-category-donut">
              <CategoryDonut data={data.category_breakdown} currency={ccy} />
            </ChartCard>
            <ChartCard title="Income vs expense" subtitle="Last 6 months" testId="dashboard-trend-chart">
              <TrendChart data={data.trend} currency={ccy} />
            </ChartCard>
          </div>

          {/* Budgets + Bills + Goals */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:0.3}}>
              <Card className="bg-card/80 border-border card-shadow">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="font-display font-semibold">Budgets</div>
                    <Link to="/app/budgets" className="text-xs text-primary hover:underline" data-testid="dashboard-view-budgets">View all</Link>
                  </div>
                  <div className="mt-4 space-y-3" data-testid="dashboard-budgets-list">
                    {(data.budgets || []).slice(0, 5).map((b) => {
                      const over = b.percent > 100;
                      const near = b.percent > 80 && !over;
                      return (
                        <div key={b.id} className="space-y-1.5">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full" style={{ background: categoryColor(b.category) }} />
                              <span>{b.category}</span>
                            </div>
                            <div className="num text-xs text-muted-foreground">
                              <Num value={b.spent} currency={ccy} /> / <Num value={b.limit} currency={ccy} />
                            </div>
                          </div>
                          <Progress value={Math.min(b.percent, 100)}
                            className={over ? "bg-destructive/20" : (near ? "bg-amber-500/20" : "")} />
                        </div>
                      );
                    })}
                    {(!data.budgets || data.budgets.length === 0) && (
                      <div className="text-xs text-muted-foreground">No budgets set for this month.</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:0.3, delay:0.05}}>
              <Card className="bg-card/80 border-border card-shadow h-full">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="font-display font-semibold">Upcoming bills</div>
                    <Link to="/app/bills" className="text-xs text-primary hover:underline" data-testid="dashboard-view-bills">Manage</Link>
                  </div>
                  <div className="mt-4 space-y-3" data-testid="dashboard-bills-list">
                    {(data.upcoming_bills || []).slice(0, 5).map((b) => {
                      const days = daysUntil(b.next_due_date);
                      const soon = days !== null && days <= 7;
                      return (
                        <div key={b.id} className="flex items-center justify-between text-sm">
                          <div>
                            <div className="font-medium">{b.name}</div>
                            <div className="text-xs text-muted-foreground">{formatDate(b.next_due_date)} • {b.frequency}</div>
                          </div>
                          <div className="text-right">
                            <div className="num text-sm"><Num value={b.amount} currency={b.currency} /></div>
                            {soon && <Badge variant="outline" className="mt-1 text-[10px] text-amber-400 border-amber-400/40">in {days}d</Badge>}
                          </div>
                        </div>
                      );
                    })}
                    {(!data.upcoming_bills || data.upcoming_bills.length === 0) && (
                      <div className="text-xs text-muted-foreground">No bills in the next 30 days.</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:0.3, delay:0.1}}>
              <Card className="bg-card/80 border-border card-shadow h-full">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="font-display font-semibold">Savings goals</div>
                    <Link to="/app/goals" className="text-xs text-primary hover:underline" data-testid="dashboard-view-goals">Manage</Link>
                  </div>
                  <div className="mt-4 space-y-4" data-testid="dashboard-goals-list">
                    {(data.goals || []).slice(0, 3).map((g) => {
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
                    {(!data.goals || data.goals.length === 0) && (
                      <div className="text-xs text-muted-foreground">No goals yet.</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Mobile quick actions */}
          <div className="md:hidden mt-6 grid grid-cols-2 gap-3">
            <Button size="lg" onClick={() => setModalOpen(true)} className="gap-2" data-testid="dashboard-add-transaction-button-mobile">
              <Plus className="h-4 w-4" /> Add
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/app/receipt")} className="gap-2" data-testid="dashboard-scan-receipt-button-mobile">
              <ScanLine className="h-4 w-4" /> Scan
            </Button>
          </div>
        </>
      )}

      <TransactionModal open={modalOpen} onOpenChange={setModalOpen} onSaved={load} />
    </AppShell>
  );
}
