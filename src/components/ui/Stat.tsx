import { cn } from "@/lib/utils";

export function Stat({
  label,
  value,
  hint,
  tone = "default",
  className,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  tone?: "default" | "success" | "warn" | "danger";
  className?: string;
}) {
  const toneCls = {
    default: "text-surface-900 dark:text-surface-50",
    success: "text-success",
    warn: "text-warn",
    danger: "text-danger",
  }[tone];
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <span className="text-xs font-medium text-surface-500 dark:text-surface-300">{label}</span>
      <span className={cn("text-2xl font-semibold tabular", toneCls)}>{value}</span>
      {hint ? (
        <span className="text-xs text-surface-500 dark:text-surface-300 tabular">{hint}</span>
      ) : null}
    </div>
  );
}
