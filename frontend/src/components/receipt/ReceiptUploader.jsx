import React from "react";
import { ScanLine, Upload, Sparkles, RotateCcw, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ReceiptUploader({ preview, loading, fileName, fileInputRef, onFileSelected, onReset }) {
  return (
    <>
      <div className="flex items-center gap-2 mb-3">
        <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
          <ScanLine className="h-4 w-4" />
        </div>
        <div className="font-display font-semibold">Upload receipt</div>
      </div>
      <div
        className="border border-dashed border-border rounded-xl aspect-[3/4] flex items-center justify-center bg-background/40 relative overflow-hidden"
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
          onChange={(e) => onFileSelected(e.target.files?.[0])}
          data-testid="receipt-upload-input"
        />
        <Button
          className="flex-1 gap-1.5"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          data-testid="receipt-choose-file-button"
        >
          <Upload className="h-4 w-4" /> {preview ? "Replace image" : "Choose image"}
        </Button>
        {preview && (
          <Button variant="outline" onClick={onReset} className="gap-1.5" data-testid="receipt-reset-button">
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
        )}
      </div>
      {fileName && <div className="mt-2 text-xs text-muted-foreground truncate">{fileName}</div>}
    </>
  );
}
