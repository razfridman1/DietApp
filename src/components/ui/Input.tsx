"use client";
import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const baseFieldCls =
  "w-full rounded-xl border border-surface-300 bg-white px-3 h-11 text-sm outline-none " +
  "placeholder:text-surface-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 " +
  "dark:border-surface-800 dark:bg-surface-900 dark:placeholder:text-surface-500";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...rest }, ref) {
    return <input ref={ref} className={cn(baseFieldCls, className)} {...rest} />;
  },
);

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...rest }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        baseFieldCls,
        "h-auto min-h-[88px] py-2 leading-6 resize-none",
        className,
      )}
      {...rest}
    />
  );
});

export function Label({
  children,
  className,
  htmlFor,
}: {
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn("block text-sm font-medium mb-1 text-surface-700 dark:text-surface-200", className)}
    >
      {children}
    </label>
  );
}
