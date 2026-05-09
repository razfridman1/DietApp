import { cn } from "@/lib/utils";

/** Coloured circle for the 1-10 health rating. */
export function RatingBadge({
  rating,
  size = "md",
  className,
}: {
  rating: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const r = Math.max(1, Math.min(10, Math.round(rating)));
  const tone =
    r <= 3
      ? "bg-success/15 text-success border-success/40"
      : r <= 6
      ? "bg-warn/15 text-warn border-warn/40"
      : "bg-danger/15 text-danger border-danger/40";
  const dim =
    size === "sm" ? "size-7 text-xs" : size === "lg" ? "size-14 text-xl" : "size-10 text-sm";
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full border-2 font-bold tabular",
        tone,
        dim,
        className,
      )}
      aria-label={`rating ${r}/10`}
    >
      {r}
    </div>
  );
}
