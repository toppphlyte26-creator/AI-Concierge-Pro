import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Plus, CalendarClock, Trash2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { CATEGORIES, CURRENCIES } from "@/lib/constants";
import { api } from "@/lib/api";
import { formatDate, daysUntil } from "@/lib/format";
import { Num } from "@/components/Num";
import { EmptyState } from "@/components/EmptyState";
import { billDueTone } from "@/lib/ui-status";

const empty = {
  name: "",
  amount: "",
  currency: "USD",
  frequency: "monthly",
  next_due_date: new Date().toISOString().slice(0,10),
  category: "Bills & Utilities",
};

function DueBadge({ tone, days }) {
  if (tone === "overdue") return <Badge className="bg-rose-500/20 text-rose-400 border-rose-400/30">Overdue</Badge>;
  if (tone === "soon") return <Badge className="bg-amber-500/20 text-amber-400 border-amber-400/30">in {days}d</Badge>;
  return null;
}

export default function Bills() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/bills");
      setItems(data);
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const add = async () => {
    if (!form.name || !form.amount || !form.next_due_date) return toast.error("All fields required");
    try {
      await api.post("/bills", { ...form, amount: Number(form.amount) });
      setOpen(false); setForm(empty); toast.success("Bill added"); load();
    } catch (e) { toast.error(e?.response?.data?.detail || "Save failed"); }
  };

  const remove = async (id) => {
    try { await api.delete(`/bills/${id}`); toast.success("Bill removed"); load(); }
    catch { toast.error("Delete failed"); }
  };

  const actions = (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5" data-testid="bills-add-button"><Plus className="h-4 w-4" /> New bill</Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border max-w-lg">
        <DialogHeader><DialogTitle className="font-display">New recurring bill</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 space-y-1.5">
            <Label>Name</Label>
            <Input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="Netflix" data-testid="bill-name-input" />
          </div>
          <div className="space-y-1.5">
            <Label>Amount</Label>
            <Input type="number" step="0.01" min="0" value={form.amount}
              onChange={(e) => setForm({...form, amount: e.target.value})}
              className="text-right font-mono tabular-nums" data-testid="bill-amount-input" />
          </div>
          <div className="space-y-1.5">
            <Label>Currency</Label>
            <Select value={form.currency} onValueChange={(v) => setForm({...form, currency: v})}>
              <SelectTrigger data-testid="bill-currency-select"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CURRENCIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Frequency</Label>
            <Select value={form.frequency} onValueChange={(v) => setForm({...form, frequency: v})}>
              <SelectTrigger data-testid="bill-frequency-select"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Next due date</Label>
            <Input type="date" value={form.next_due_date}
              onChange={(e) => setForm({...form, next_due_date: e.target.value})} data-testid="bill-date-input" />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label>Category</Label>
            <Select value={form.category} onValueChange={(v) => setForm({...form, category: v})}>
              <SelectTrigger data-testid="bill-category-select"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={add} data-testid="bill-save-button">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <AppShell title="Recurring Bills" actions={actions}>
      {loading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : items.length === 0 ? (
        <EmptyState icon={CalendarClock}
          title="No recurring bills"
          description="Track subscriptions, rent, utilities, and more."
          actionLabel="New bill"
          onAction={() => setOpen(true)}
          testId="bills-empty" />
      ) : (
        <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:0.3}}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" data-testid="bills-list">
          {items.map(b => {
            const days = daysUntil(b.next_due_date);
            const tone = billDueTone(days);
            return (
              <Card key={b.id} className="bg-card/80 border-border card-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-display font-semibold">{b.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{b.category} • {b.frequency}</div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => remove(b.id)}
                      className="h-7 w-7 text-muted-foreground hover:text-rose-400" data-testid={`bill-delete-${b.id}`}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-3 num text-2xl font-semibold"><Num value={b.amount} currency={b.currency} /></div>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <div>Next: {formatDate(b.next_due_date)}</div>
                    <DueBadge tone={tone} days={days} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </motion.div>
      )}
    </AppShell>
  );
}
