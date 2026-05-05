import { cn } from "@/lib/utils";

/**
 * RTL-aware bar — fills from the right.
 */
export function Progress({
  value,
  max,
  className,
  tone = "brand",
}: {
  value: number;
  max: number;
  className?: string;
  tone?: "brand" | "success" | "warn" | "danger";
}) {
  const pct = Math.max(0, Math.min(100, (value / Math.max(1, max)) * 100));
  const fillCls = {
    brand: "bg-brand-500",
    success: "bg-success",
    warn: "bg-warn",
    danger: "bg-danger",
  }[tone];
  return (
    <div
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-surface-200 dark:bg-surface-800",
        className,
      )}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemax={max}
    >
      <div
        className={cn("absolute top-0 right-0 h-full transition-all", fillCls)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
