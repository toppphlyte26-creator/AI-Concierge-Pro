import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ScanLine, Upload, Sparkles, RotateCcw, Save, CheckCircle2, Image as ImageIcon } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { api } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { useNavigate } from "react-router-dom";

export default function ReceiptScan() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null); // dataURL
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fields, setFields] = useState(null);

  const reset = () => {
    setPreview(null); setFields(null); setFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image");
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(file);

    setLoading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const { data } = await api.post("/receipts/scan", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFields({
        ...data,
        // Ensure editable fields exist
        merchant: data.merchant || "",
        total_amount: data.total_amount || 0,
        currency: data.currency || "USD",
        date: data.date || new Date().toISOString().slice(0,10),
        category: data.category || "Other",
      });
      toast.success("Receipt analyzed. Review below and save.");
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    if (!fields) return;
    if (!fields.merchant || !fields.total_amount) {
      toast.error("Merchant and total are required.");
      return;
    }
    setSaving(true);
    try {
      await api.post("/transactions", {
        description: fields.merchant,
        merchant: fields.merchant,
        amount: Number(fields.total_amount),
        currency: fields.currency || "USD",
        category: fields.category || undefined,
        date: fields.date || undefined,
        type: "expense",
        notes: fields.items?.length ? `AI extracted ${fields.items.length} items` : undefined,
      });
      toast.success("Saved as transaction");
      navigate("/app/transactions");
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell title="Scan Receipt">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Upload / Preview */}
        <Card className="lg:col-span-2 bg-card/80 border-border card-shadow overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <ScanLine className="h-4 w-4" />
              </div>
              <div className="font-display font-semibold">Upload receipt</div>
            </div>
            <div
              className={"border border-dashed border-border rounded-xl aspect-[3/4] flex items-center justify-center bg-background/40 relative overflow-hidden"}
              data-testid="receipt-drop-zone"
            >
              {preview ? (
                <img src={preview} alt="receipt" className="absolute inset-0 h-full w-full object-contain" />
              ) : (
                <div className="text-center px-4">
                  <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <div className="text-sm text-muted-foreground">Choose a receipt image (JPEG/PNG/WEBP)</div>
                </div>
              )}
              {loading && (
                <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <Sparkles className="h-4 w-4 animate-pulse" /> Analyzing receipt…
                  </div>
                </div>
              )}
            </div>
            <div className="mt-4 flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onFile(e.target.files?.[0])}
                data-testid="receipt-upload-input"
              />
              <Button className="flex-1 gap-1.5" onClick={() => fileInputRef.current?.click()} disabled={loading} data-testid="receipt-choose-file-button">
                <Upload className="h-4 w-4" /> {preview ? "Replace image" : "Choose image"}
              </Button>
              {preview && (
                <Button variant="outline" onClick={reset} className="gap-1.5" data-testid="receipt-reset-button">
                  <RotateCcw className="h-4 w-4" /> Reset
                </Button>
              )}
            </div>
            {fileName && (
              <div className="mt-2 text-xs text-muted-foreground truncate">{fileName}</div>
            )}
          </CardContent>
        </Card>

        {/* Extracted fields */}
        <Card className="lg:col-span-3 bg-card/80 border-border card-shadow">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="font-display font-semibold">AI extracted fields</div>
            </div>
            {!fields ? (
              <div className="h-64 flex items-center justify-center text-sm text-muted-foreground text-center">
                Upload a receipt to see AI-extracted merchant, total, date, currency, and category.
              </div>
            ) : (
              <motion.div initial={{opacity:0, y:8}} animate={{opacity:1, y:0}} transition={{duration:0.3}} className="grid grid-cols-2 gap-3" data-testid="receipt-preview-card">
                <div className="col-span-2 space-y-1.5">
                  <Label>Merchant</Label>
                  <Input value={fields.merchant} onChange={(e) => setFields({...fields, merchant: e.target.value})} data-testid="receipt-field-merchant" />
                </div>
                <div className="space-y-1.5">
                  <Label>Total amount</Label>
                  <Input type="number" step="0.01" min="0" className="text-right font-mono tabular-nums"
                    value={fields.total_amount}
                    onChange={(e) => setFields({...fields, total_amount: e.target.value})}
                    data-testid="receipt-field-amount" />
                </div>
                <div className="space-y-1.5">
                  <Label>Currency</Label>
                  <Select value={fields.currency} onValueChange={(v) => setFields({...fields, currency: v})}>
                    <SelectTrigger data-testid="receipt-field-currency"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Date</Label>
                  <Input type="date" value={fields.date}
                    onChange={(e) => setFields({...fields, date: e.target.value})}
                    data-testid="receipt-field-date" />
                </div>
                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <Select value={fields.category} onValueChange={(v) => setFields({...fields, category: v})}>
                    <SelectTrigger data-testid="receipt-field-category"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {Array.isArray(fields.items) && fields.items.length > 0 && (
                  <div className="col-span-2 mt-2">
                    <div className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Detected items</div>
                    <div className="rounded-lg border border-border divide-y divide-border">
                      {fields.items.slice(0, 8).map((it, i) => (
                        <div key={i} className="flex items-center justify-between px-3 py-1.5 text-sm">
                          <div className="truncate">{it.name || "—"}</div>
                          <div className="num">{Number(it.price || 0).toFixed(2)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="col-span-2 flex justify-end gap-2 mt-3">
                  <Button variant="ghost" onClick={reset} data-testid="receipt-cancel-button">Cancel</Button>
                  <Button onClick={save} disabled={saving} className="gap-1.5" data-testid="receipt-save-button">
                    <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save as transaction"}
                  </Button>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
