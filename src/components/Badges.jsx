import React from "react";
import { ACCESS_CLASSES, REVIEW_STATES } from "@/lib/polarSetu";
import { cn } from "@/lib/utils";

export function AccessBadge({ accessClass, className }) {
  const config = ACCESS_CLASSES[accessClass] || ACCESS_CLASSES.open;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold tracking-wide",
        config.color,
        className
      )}
      title={config.description}
    >
      {config.label}
    </span>
  );
}

export function ReviewBadge({ status, className }) {
  const config = REVIEW_STATES[status] || REVIEW_STATES.draft;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold tracking-wide",
        config.color,
        className
      )}
    >
      {config.label}
    </span>
  );
}

export function PrototypeTag({ className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded border border-saffron/30 bg-saffron/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-saffron",
        className
      )}
      style={{ color: "hsl(31 89% 50%)" }}
    >
      Prototype Data
    </span>
  );
}