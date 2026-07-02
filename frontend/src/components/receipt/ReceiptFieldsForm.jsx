import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Save } from "lucide-react";
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
import { CATEGORIES, CURRENCIES } from "@/lib/constants";

function ItemList({ items }) {
  if (!Array.isArray(items) || items.length === 0) return null;
  return (
    <div className="col-span-2 mt-2">
      <div className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Detected items</div>
      <div className="rounded-lg border border-border divide-y divide-border">
        {items.slice(0, 8).map((it) => (
          <div key={it._rid || `${it.name}-${it.price}`} className="flex items-center justify-between px-3 py-1.5 text-sm">
            <div className="truncate">{it.name || "—"}</div>
            <div className="num">{Number(it.price || 0).toFixed(2)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ReceiptFieldsForm({ fields, onFieldChange, onSave, onCancel, saving }) {
  if (!fields) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-muted-foreground text-center">
        Upload a receipt to see AI-extracted merchant, total, date, currency, and category.
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
      className="grid grid-cols-2 gap-3" data-testid="receipt-preview-card"
    >
      <div className="col-span-2 space-y-1.5">
        <Label>Merchant</Label>
        <Input value={fields.merchant} onChange={(e) => onFieldChange("merchant", e.target.value)}
          data-testid="receipt-field-merchant" />
      </div>
      <div className="space-y-1.5">
        <Label>Total amount</Label>
        <Input type="number" step="0.01" min="0" className="text-right font-mono tabular-nums"
          value={fields.total_amount}
          onChange={(e) => onFieldChange("total_amount", e.target.value)}
          data-testid="receipt-field-amount" />
      </div>
      <div className="space-y-1.5">
        <Label>Currency</Label>
        <Select value={fields.currency} onValueChange={(v) => onFieldChange("currency", v)}>
          <SelectTrigger data-testid="receipt-field-currency"><SelectValue /></SelectTrigger>
          <SelectContent>
            {CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>Date</Label>
        <Input type="date" value={fields.date}
          onChange={(e) => onFieldChange("date", e.target.value)}
          data-testid="receipt-field-date" />
      </div>
      <div className="space-y-1.5">
        <Label>Category</Label>
        <Select value={fields.category} onValueChange={(v) => onFieldChange("category", v)}>
          <SelectTrigger data-testid="receipt-field-category"><SelectValue /></SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <ItemList items={fields.items} />
      <div className="col-span-2 flex justify-end gap-2 mt-3">
        <Button variant="ghost" onClick={onCancel} data-testid="receipt-cancel-button">Cancel</Button>
        <Button onClick={onSave} disabled={saving} className="gap-1.5" data-testid="receipt-save-button">
          <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save as transaction"}
        </Button>
      </div>
    </motion.div>
  );
}

export function ReceiptFieldsHeader() {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
        <Sparkles className="h-4 w-4" />
      </div>
      <div className="font-display font-semibold">AI extracted fields</div>
    </div>
  );
}
