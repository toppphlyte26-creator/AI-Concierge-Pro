import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Plus, PiggyBank, Trash2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EXPENSE_CATEGORIES, categoryColor } from "@/lib/constants";
import { api } from "@/lib/api";
import { Num } from "@/components/Num";
import { currentMonth } from "@/lib/format";
import { EmptyState } from "@/components/EmptyState";
import { budgetStatus } from "@/lib/ui-status";

function BudgetStatusText({ percent }) {
  const status = budgetStatus(percent);
  if (status === "over") return <span className="text-rose-400">Over budget</span>;
  if (status === "near") return <span className="text-amber-400">Nearing limit</span>;
  return null;
}

export default function Budgets() {
  const [month] = useState(currentMonth());
  const [dashboardBudgets, setDashboardBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [category, setCategory] = useState("");
  const [limit, setLimit] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/dashboard");
      setDashboardBudgets(data.budgets || []);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const add = async () => {
    if (!category || !limit) return toast.error("Category and limit required");
    try {
      await api.post("/budgets", { category, limit: Number(limit), month });
      setAddOpen(false); setCategory(""); setLimit("");
      toast.success("Budget saved");
      load();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Save failed");
    }
  };

  const remove = async (id) => {
    try { await api.delete(`/budgets/${id}`); toast.success("Budget removed"); load(); }
    catch { toast.error("Delete failed"); }
  };

  const actions = (
    <Dialog open={addOpen} onOpenChange={setAddOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5" data-testid="budgets-add-button"><Plus className="h-4 w-4"/> New budget</Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader><DialogTitle className="font-display">New budget</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger data-testid="budget-category-select"><SelectValue placeholder="Pick a category" /></SelectTrigger>
              <SelectContent>
                {EXPENSE_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Monthly limit</Label>
            <Input type="number" step="1" min="0" value={limit} onChange={(e) => setLimit(e.target.value)}
              className="text-right font-mono tabular-nums" placeholder="500" data-testid="budget-limit-input" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button>
          <Button onClick={add} data-testid="budget-save-button">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <AppShell title={`Budgets — ${month}`} actions={actions}>
      {loading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : dashboardBudgets.length === 0 ? (
        <EmptyState
          icon={PiggyBank}
          title="No budgets set"
          description="Create budgets for your top spending categories to stay on track."
          actionLabel="New budget"
          onAction={() => setAddOpen(true)}
          testId="budgets-empty"
        />
      ) : (
        <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:0.3}}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" data-testid="budgets-grid">
          {dashboardBudgets.map(b => {
            const status = budgetStatus(b.percent);
            const ring = status === "over" ? "ring-1 ring-destructive/40" : "";
            return (
              <Card key={b.id} className={`bg-card/80 border-border card-shadow ${ring}`}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{background: categoryColor(b.category)}} />
                      <div className="font-display font-semibold">{b.category}</div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => remove(b.id)}
                      className="h-7 w-7 text-muted-foreground hover:text-rose-400" data-testid={`budget-delete-${b.id}`}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-3 num text-2xl font-semibold">
                    <Num value={b.spent} />
                    <span className="text-sm text-muted-foreground"> / <Num value={b.limit} /></span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <div>{Math.min(b.percent, 999).toFixed(1)}% used</div>
                    <BudgetStatusText percent={b.percent} />
                  </div>
                  <Progress value={Math.min(b.percent, 100)} className="mt-2" />
                </CardContent>
              </Card>
            );
          })}
        </motion.div>
      )}
    </AppShell>
  );
}
