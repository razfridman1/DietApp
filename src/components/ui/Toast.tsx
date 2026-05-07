"use client";
import { useEffect } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastTone = "success" | "error";

export function Toast({
  message,
  tone,
  onClose,
  duration = 4500,
}: {
  message: string;
  tone: ToastTone;
  onClose: () => void;
  duration?: number;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [onClose, duration]);

  const Icon = tone === "success" ? CheckCircle2 : XCircle;
  return (
    <div
      role="status"
      aria-live="polite"
      dir="rtl"
      className="fixed inset-x-0 top-3 z-50 mx-auto w-fit max-w-[92vw] animate-in fade-in slide-in-from-top-2"
    >
      <div
        className={cn(
          "flex items-center gap-2 rounded-2xl border px-4 py-2.5 shadow-card backdrop-blur",
          tone === "success"
            ? "border-success/30 bg-success/10 text-success"
            : "border-danger/30 bg-danger/10 text-danger",
        )}
      >
        <Icon className="size-5 shrink-0" />
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
}
