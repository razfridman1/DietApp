"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Sparkles, RefreshCw, Clock, Flame, Beef, X, Check } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/client-api";
import { cn } from "@/lib/utils";

interface QuickSuggestion {
  name: string;
  description: string;
  calories: number;
  protein: number;
  ingredients: string[];
  prepTime: number;
  fills: string;
}

interface TipResult {
  gaps: string[];
  suggestions: QuickSuggestion[];
}

export function AIWhatsMissing() {
  const [open, setOpen] = useState(false);
  const tip = useMutation({
    mutationFn: () => api.post<TipResult>("/api/ai/dashboard-tip"),
    onSuccess: () => setOpen(true),
  });

  const result = tip.data;

  return (
    <Card
      className={cn(
        "border-brand-200 bg-brand-50/40 dark:bg-brand-900/20 dark:border-brand-900",
        "p-3",
      )}
    >
      <div className="flex items-center gap-2">
        <Sparkles className="size-4 shrink-0 text-brand-600" />
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold leading-tight">מה חסר לי היום?</h3>
          <p className="text-[11px] text-surface-500">
            ניתוח AI + הצעות זריזות ממה שיש במטבח רגיל
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => tip.mutate()}
          loading={tip.isPending}
          disabled={tip.isPending}
        >
          {result ? <RefreshCw className="size-4" /> : <Sparkles className="size-4" />}
          {tip.isPending ? "מנתח..." : result ? "רענון" : "ניתוח"}
        </Button>
      </div>

      {tip.error ? (
        <p className="mt-2 text-xs text-danger">
          {(tip.error as Error)?.message || "שגיאה בניתוח. נסה/י שוב."}
        </p>
      ) : null}

      {result && open ? (
        <div className="mt-3 space-y-3 border-t border-brand-200 pt-3 dark:border-brand-900">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-surface-500">
              מה חסר
            </h4>
            <button
              onClick={() => setOpen(false)}
              className="rounded p-0.5 text-surface-400 hover:text-surface-600"
              aria-label="סגירה"
            >
              <X className="size-4" />
            </button>
          </div>

          {result.gaps.length === 0 ? (
            <p className="flex items-center gap-1.5 text-sm text-success">
              <Check className="size-4" />
              היום שלך מאוזן — אין פערים בולטים!
            </p>
          ) : (
            <ul className="space-y-1.5">
              {result.gaps.map((g, i) => (
                <li
                  key={i}
                  className="flex gap-2 rounded-lg border border-warn/30 bg-warn/5 px-2.5 py-1.5 text-xs"
                >
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-warn" />
                  <span>{g}</span>
                </li>
              ))}
            </ul>
          )}

          {result.suggestions.length > 0 ? (
            <>
              <h4 className="mt-3 text-xs font-semibold uppercase tracking-wide text-surface-500">
                הצעות זריזות
              </h4>
              <ul className="space-y-2">
                {result.suggestions.map((s, i) => (
                  <li
                    key={i}
                    className="rounded-xl border border-surface-200 bg-white p-2.5 dark:border-surface-800 dark:bg-surface-900"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h5 className="text-sm font-semibold leading-tight">
                          {s.name}
                        </h5>
                        {s.description ? (
                          <p className="mt-0.5 text-[11px] text-surface-600 dark:text-surface-300 leading-snug">
                            {s.description}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-0.5 text-[10px]">
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-brand-50 px-1.5 py-0.5 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
                          <Flame className="size-2.5" />
                          {s.calories}
                        </span>
                        {s.protein > 0 ? (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                            <Beef className="size-2.5" />
                            {s.protein}g
                          </span>
                        ) : null}
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-surface-100 px-1.5 py-0.5 text-surface-700 dark:bg-surface-800 dark:text-surface-300">
                          <Clock className="size-2.5" />
                          {s.prepTime} דק׳
                        </span>
                      </div>
                    </div>

                    {s.ingredients.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {s.ingredients.map((ing, j) => (
                          <span
                            key={j}
                            className="rounded-full bg-surface-100 px-2 py-0.5 text-[10px] text-surface-700 dark:bg-surface-800 dark:text-surface-200"
                          >
                            {ing}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    {s.fills ? (
                      <p className="mt-1.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-300">
                        ✓ {s.fills}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}
