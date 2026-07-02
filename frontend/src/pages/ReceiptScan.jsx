import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { ReceiptUploader } from "@/components/receipt/ReceiptUploader";
import { ReceiptFieldsForm, ReceiptFieldsHeader } from "@/components/receipt/ReceiptFieldsForm";
import { useReceiptProcessor } from "@/hooks/useReceiptProcessor";
import { api } from "@/lib/api";

export default function ReceiptScan() {
  const navigate = useNavigate();
  const {
    fileInputRef, preview, fileName, loading, fields, error,
    analyze, reset, updateField,
  } = useReceiptProcessor();
  const [saving, setSaving] = useState(false);

  // Surface hook errors as toasts.
  useEffect(() => { if (error) toast.error(error); }, [error]);

  const onFile = useCallback(async (file) => {
    const res = await analyze(file);
    if (res) toast.success("Receipt analyzed. Review below and save.");
  }, [analyze]);

  const save = useCallback(async () => {
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
  }, [fields, navigate]);

  return (
    <AppShell title="Scan Receipt">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-2 bg-card/80 border-border card-shadow overflow-hidden">
          <CardContent className="p-5">
            <ReceiptUploader
              preview={preview}
              loading={loading}
              fileName={fileName}
              fileInputRef={fileInputRef}
              onFileSelected={onFile}
              onReset={reset}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 bg-card/80 border-border card-shadow">
          <CardContent className="p-5">
            <ReceiptFieldsHeader />
            <ReceiptFieldsForm
              fields={fields}
              onFieldChange={updateField}
              onSave={save}
              onCancel={reset}
              saving={saving}
            />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
