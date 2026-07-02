import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Plus, Target, Trash2, PlusCircle } from "lucide-react";
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
import { CURRENCIES } from "@/lib/constants";
import { api } from "@/lib/api";
import { formatDate, daysUntil } from "@/lib/format";
import { Num } from "@/components/Num";
import { EmptyState } from "@/components/EmptyState";

const empty = {
  name: "",
  target_amount: "",
  current_amount: "0",
  currency: "USD",
  target_date: "",
};

function GoalDateLine({ targetDate }) {
  if (!targetDate) return null;
  const days = daysUntil(targetDate);
  const suffix = days !== null ? ` • ${days}d left` : "";
  return (
    <div className="text-xs text-muted-foreground mt-0.5">
      By {formatDate(targetDate)}{suffix}
    </div>
  );
}

export default function Goals() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [contribGoal, setContribGoal] = useState(null);
  const [contribAmount, setContribAmount] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/goals");
      setItems(data);
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const add = async () => {
    if (!form.name || !form.target_amount) return toast.error("Name and target required");
    try {
      await api.post("/goals", {
        name: form.name,
        target_amount: Number(form.target_amount),
        current_amount: Number(form.current_amount || 0),
        currency: form.currency,
        target_date: form.target_date || undefined,
      });
      setOpen(false); setForm(empty); toast.success("Goal created"); load();
    } catch (e) { toast.error(e?.response?.data?.detail || "Save failed"); }
  };

  const contribute = async () => {
    const amt = Number(contribAmount);
    if (!amt || amt <= 0) return toast.error("Enter a positive amount");
    try {
      await api.post(`/goals/${contribGoal.id}/contribute`, { amount: amt });
      toast.success("Contribution added");
      setContribGoal(null); setContribAmount(""); load();
    } catch { toast.error("Failed"); }
  };

  const remove = async (id) => {
    try { await api.delete(`/goals/${id}`); toast.success("Goal removed"); load(); }
    catch { toast.error("Delete failed"); }
  };

  const actions = (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5" data-testid="goals-add-button"><Plus className="h-4 w-4" /> New goal</Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border max-w-lg">
        <DialogHeader><DialogTitle className="font-display">New savings goal</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 space-y-1.5">
            <Label>Name</Label>
            <Input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="Emergency Fund" data-testid="goal-name-input" />
          </div>
          <div className="space-y-1.5">
            <Label>Target amount</Label>
            <Input type="number" step="1" min="0" value={form.target_amount}
              onChange={(e) => setForm({...form, target_amount: e.target.value})}
              className="text-right font-mono tabular-nums" data-testid="goal-target-input" />
          </div>
          <div className="space-y-1.5">
            <Label>Current amount</Label>
            <Input type="number" step="1" min="0" value={form.current_amount}
              onChange={(e) => setForm({...form, current_amount: e.target.value})}
              className="text-right font-mono tabular-nums" data-testid="goal-current-input" />
          </div>
          <div className="space-y-1.5">
            <Label>Currency</Label>
            <Select value={form.currency} onValueChange={(v) => setForm({...form, currency: v})}>
              <SelectTrigger data-testid="goal-currency-select"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CURRENCIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Target date</Label>
            <Input type="date" value={form.target_date}
              onChange={(e) => setForm({...form, target_date: e.target.value})} data-testid="goal-date-input" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={add} data-testid="goal-save-button">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <AppShell title="Savings Goals" actions={actions}>
      {loading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : items.length === 0 ? (
        <EmptyState icon={Target} title="No goals yet"
          description="Set a goal like Emergency Fund or Japan Trip 2026."
          actionLabel="New goal"
          onAction={() => setOpen(true)}
          testId="goals-empty" />
      ) : (
        <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:0.3}}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" data-testid="goals-grid">
          {items.map(g => {
            const pct = Math.min((g.current_amount / g.target_amount) * 100, 100);
            return (
              <Card key={g.id} className="bg-card/80 border-border card-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-display font-semibold">{g.name}</div>
                      <GoalDateLine targetDate={g.target_date} />
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => remove(g.id)}
                      className="h-7 w-7 text-muted-foreground hover:text-rose-400" data-testid={`goal-delete-${g.id}`}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-3 num text-2xl font-semibold">
                    <Num value={g.current_amount} currency={g.currency} />
                    <span className="text-sm text-muted-foreground"> / <Num value={g.target_amount} currency={g.currency} /></span>
                  </div>
                  <div className="mt-3 text-xs text-muted-foreground">{pct.toFixed(1)}% funded</div>
                  <Progress value={pct} className="mt-2" />
                  <Button variant="outline" size="sm" className="mt-4 w-full gap-1.5"
                    onClick={() => setContribGoal(g)} data-testid={`goal-contribute-${g.id}`}>
                    <PlusCircle className="h-4 w-4" /> Add contribution
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </motion.div>
      )}

      <Dialog open={!!contribGoal} onOpenChange={(o) => { if (!o) { setContribGoal(null); setContribAmount(""); } }}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader><DialogTitle className="font-display">Contribute to {contribGoal?.name}</DialogTitle></DialogHeader>
          <div className="space-y-1.5">
            <Label>Amount ({contribGoal?.currency})</Label>
            <Input type="number" step="1" min="0" value={contribAmount}
              onChange={(e) => setContribAmount(e.target.value)}
              className="text-right font-mono tabular-nums" data-testid="goal-contribute-amount-input" />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setContribGoal(null); setContribAmount(""); }}>Cancel</Button>
            <Button onClick={contribute} data-testid="goal-contribute-submit">Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
