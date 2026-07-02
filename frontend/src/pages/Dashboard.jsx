import React, { useCallback, useEffect, useState } from "react";
import { Plus, ScanLine } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { DashboardKpiRow } from "@/components/dashboard/DashboardKpiRow";
import { DashboardChartsRow } from "@/components/dashboard/DashboardChartsRow";
import { BudgetsPanel } from "@/components/dashboard/BudgetsPanel";
import { BillsPanel } from "@/components/dashboard/BillsPanel";
import { GoalsPanel } from "@/components/dashboard/GoalsPanel";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { TransactionModal } from "@/components/TransactionModal";

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/dashboard");
      setData(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const ccy = data?.base_currency || "USD";

  const actions = (
    <div className="hidden md:flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={() => navigate("/app/receipt")}
        data-testid="dashboard-scan-receipt-button" className="gap-1.5">
        <ScanLine className="h-4 w-4" /> Scan receipt
      </Button>
      <Button size="sm" onClick={() => setModalOpen(true)}
        data-testid="dashboard-add-transaction-button" className="gap-1.5">
        <Plus className="h-4 w-4" /> Add transaction
      </Button>
    </div>
  );

  return (
    <AppShell title="Dashboard" actions={actions}>
      {(loading || !data) ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[0,1,2,3].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : (
        <>
          <DashboardKpiRow kpis={data.kpis} currency={ccy} />
          <DashboardChartsRow categoryBreakdown={data.category_breakdown} trend={data.trend} currency={ccy} />
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <BudgetsPanel budgets={data.budgets} currency={ccy} />
            <BillsPanel bills={data.upcoming_bills} />
            <GoalsPanel goals={data.goals} />
          </div>
          <div className="md:hidden mt-6 grid grid-cols-2 gap-3">
            <Button size="lg" onClick={() => setModalOpen(true)} className="gap-2"
              data-testid="dashboard-add-transaction-button-mobile">
              <Plus className="h-4 w-4" /> Add
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/app/receipt")}
              className="gap-2" data-testid="dashboard-scan-receipt-button-mobile">
              <ScanLine className="h-4 w-4" /> Scan
            </Button>
          </div>
        </>
      )}

      <TransactionModal open={modalOpen} onOpenChange={setModalOpen} onSaved={load} />
    </AppShell>
  );
}
