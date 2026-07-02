import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORIES, EXPENSE_CATEGORIES, CURRENCIES } from "@/lib/constants";
import { api } from "@/lib/api";

const EMPTY_TX = {
  description: "",
  merchant: "",
  amount: "",
  currency: "USD",
  category: "",
  date: new Date().toISOString().slice(0, 10),
  type: "expense",
  notes: "",
};

function validateForm(form) {
  if (!form.description) return "Description is required";
  if (!form.amount) return "Amount is required";
  return null;
}

function buildPayload(form) {
  return {
    description: form.description,
    merchant: form.merchant || form.description,
    amount: Number(form.amount),
    currency: form.currency,
    category: form.category || undefined,
    date: form.date,
    type: form.type,
    notes: form.notes || undefined,
  };
}

// --- Sub-form components -----------------------------------------------------

function DescriptionField({ form, onChange }) {
  return (
    <div className="col-span-2 space-y-1.5">
      <Label>Description</Label>
      <Input
        value={form.description}
        onChange={(e) => onChange("description", e.target.value)}
        placeholder="Starbucks coffee downtown"
        data-testid="tx-description-input"
      />
    </div>
  );
}

function AmountAndCurrency({ form, onChange }) {
  return (
    <>
      <div className="space-y-1.5">
        <Label>Amount</Label>
        <Input
          type="number" step="0.01" min="0"
          value={form.amount}
          onChange={(e) => onChange("amount", e.target.value)}
          className="text-right font-mono tabular-nums"
          data-testid="tx-amount-input"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Currency</Label>
        <Select value={form.currency} onValueChange={(v) => onChange("currency", v)}>
          <SelectTrigger data-testid="tx-currency-select"><SelectValue /></SelectTrigger>
          <SelectContent>
            {CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    </>
  );
}

function TypeAndDate({ form, onChange, onTypeChange }) {
  return (
    <>
      <div className="space-y-1.5">
        <Label>Type</Label>
        <Select value={form.type} onValueChange={onTypeChange}>
          <SelectTrigger data-testid="tx-type-select"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="expense">Expense</SelectItem>
            <SelectItem value="income">Income</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>Date</Label>
        <Input
          type="date"
          value={form.date}
          onChange={(e) => onChange("date", e.target.value)}
          data-testid="tx-date-input"
        />
      </div>
    </>
  );
}

function CategoryField({ form, onChange, categories, onSuggest, suggesting }) {
  return (
    <div className="col-span-2 space-y-1.5">
      <div className="flex items-center justify-between">
        <Label>Category</Label>
        <Button
          type="button" size="sm" variant="ghost"
          onClick={onSuggest} disabled={suggesting}
          className="h-7 gap-1.5 text-primary"
          data-testid="tx-ai-suggest-button"
        >
          <Sparkles className="h-3.5 w-3.5" />
          {suggesting ? "Thinking…" : "AI suggest"}
        </Button>
      </div>
      <Select value={form.category} onValueChange={(v) => onChange("category", v)}>
        <SelectTrigger data-testid="tx-category-select">
          <SelectValue placeholder="Pick a category (or let AI suggest)" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

export function TransactionModal({ open, onOpenChange, onSaved, initial }) {
  const [form, setForm] = useState(EMPTY_TX);
  const [saving, setSaving] = useState(false);
  const [suggesting, setSuggesting] = useState(false);

  useEffect(() => {
    if (open) setForm(initial ? { ...EMPTY_TX, ...initial } : EMPTY_TX);
  }, [open, initial]);

  const onChange = useCallback((key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
  }, []);

  const onTypeChange = useCallback((value) => {
    // Switching type clears category (income vs expense sets differ).
    setForm((f) => ({ ...f, type: value, category: "" }));
  }, []);

  const suggest = async () => {
    if (!form.description.trim()) {
      toast.info("Enter a description first.");
      return;
    }
    setSuggesting(true);
    try {
      const { data } = await api.post("/ai/categorize", { description: form.description });
      setForm((f) => ({ ...f, category: data.category }));
      toast.success(`AI suggested: ${data.category}`);
    } catch {
      toast.error("AI suggestion failed");
    } finally {
      setSuggesting(false);
    }
  };

  const submit = async () => {
    const err = validateForm(form);
    if (err) { toast.error(err); return; }
    setSaving(true);
    try {
      const payload = buildPayload(form);
      if (initial?.id) {
        await api.patch(`/transactions/${initial.id}`, payload);
        toast.success("Transaction updated");
      } else {
        await api.post("/transactions", payload);
        toast.success("Transaction added");
      }
      onSaved && onSaved();
      onOpenChange(false);
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const categories = form.type === "income" ? CATEGORIES : EXPENSE_CATEGORIES;
  const titleText = initial?.id ? "Edit Transaction" : "Add Transaction";
  const submitLabelIdle = initial?.id ? "Update" : "Add transaction";
  const submitLabel = saving ? "Saving…" : submitLabelIdle;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display">{titleText}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <DescriptionField form={form} onChange={onChange} />
          <AmountAndCurrency form={form} onChange={onChange} />
          <TypeAndDate form={form} onChange={onChange} onTypeChange={onTypeChange} />
          <CategoryField
            form={form}
            onChange={onChange}
            categories={categories}
            onSuggest={suggest}
            suggesting={suggesting}
          />
          <div className="col-span-2 space-y-1.5">
            <Label>Notes (optional)</Label>
            <Textarea
              rows={2}
              value={form.notes}
              onChange={(e) => onChange("notes", e.target.value)}
              data-testid="tx-notes-input"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} data-testid="tx-cancel-button">Cancel</Button>
          <Button onClick={submit} disabled={saving} data-testid="tx-save-button">
            {submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
