import { useCallback, useRef, useState } from "react";
import { api } from "@/lib/api";

/**
 * Custom hook that encapsulates the receipt scan flow:
 * - file selection + preview
 * - upload to /receipts/scan
 * - editable extracted fields
 * - reset
 */
export function useReceiptProcessor() {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [fields, setFields] = useState(null);
  const [error, setError] = useState(null);

  const reset = useCallback(() => {
    setPreview(null);
    setFields(null);
    setFileName("");
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const readPreview = (file) =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });

  const analyze = useCallback(async (file) => {
    if (!file) return null;
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image");
      return null;
    }
    setFileName(file.name);
    setError(null);
    setPreview(await readPreview(file));
    setLoading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const { data } = await api.post("/receipts/scan", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // Give each item a stable local id so it can be used as a React key
      // without falling back to array index.
      const withIds = (data.items || []).map((it, i) => ({
        ...it,
        _rid: (typeof crypto !== "undefined" && crypto.randomUUID)
          ? crypto.randomUUID()
          : `${it.name || "item"}-${it.price ?? 0}-${i}`,
      }));
      const normalized = {
        ...data,
        merchant: data.merchant || "",
        total_amount: data.total_amount || 0,
        currency: data.currency || "USD",
        date: data.date || new Date().toISOString().slice(0, 10),
        category: data.category || "Other",
        items: withIds,
      };
      setFields(normalized);
      return normalized;
    } catch (e) {
      const msg = e?.response?.data?.detail || "Analysis failed. Please try again.";
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateField = useCallback((key, value) => {
    setFields((f) => (f ? { ...f, [key]: value } : f));
  }, []);

  return {
    fileInputRef,
    preview,
    fileName,
    loading,
    fields,
    error,
    analyze,
    reset,
    updateField,
  };
}
