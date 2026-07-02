import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction, testId, className }) {
  return (
    <div
      data-testid={testId}
      className={cn(
        "flex flex-col items-center justify-center text-center gap-3 py-10 px-6 rounded-xl border border-dashed border-border bg-card/40",
        className
      )}
    >
      {Icon ? (
        <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          <Icon className="h-5 w-5" />
        </div>
      ) : null}
      <div className="space-y-1 max-w-md">
        <div className="text-sm font-display font-semibold text-foreground">{title}</div>
        {description ? (
          <div className="text-xs text-muted-foreground">{description}</div>
        ) : null}
      </div>
      {actionLabel ? (
        <Button size="sm" onClick={onAction} data-testid={`${testId || "empty"}-action`}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
