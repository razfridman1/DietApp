"use client";
import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(function Select({ className, children, ...rest }, ref) {
  return (
    <select
      ref={ref}
      className={cn(
        "w-full rounded-xl border border-surface-300 bg-white px-3 h-11 text-sm",
        "dark:border-surface-800 dark:bg-surface-900 outline-none",
        "focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30",
        className,
      )}
      {...rest}
    >
      {children}
    </select>
  );
});
