"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Trash2,
  Sparkles,
  RefreshCw,
  Salad,
  GlassWater,
  Check,
  Lock,
} from "lucide-react";
import { Card, CardSubtle, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { api } from "@/lib/client-api";
import { useI18n } from "@/lib/i18n/provider";
import { todayISO } from "@/lib/format";
import type { DailyIntakeItem, DayAnalysisPayload } from "@/lib/health/types";
import { RatingBadge } from "./RatingBadge";
import { cn } from "@/lib/utils";

export function DailyIntakePanel() {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const date = todayISO();

  const itemsQ = useQuery({
    queryKey: ["health", "daily", date],
    queryFn: () =>
      api.get<{ items: DailyIntakeItem[]; date: string }>(
        `/api/health/daily?date=${date}`,
      ),
  });

  const items = itemsQ.data?.items ?? [];

  const analyze = useMutation({
    mutationFn: (refresh: boolean) =>
      api.post<{ payload: DayAnalysisPayload; cached: boolean }>(
        "/api/health/analyze-day",
        { date, lang, refresh },
      ),
  });

  const del = useMutation({
    mutationFn: (id: string) => api.del(`/api/health/daily/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["health", "daily", date] }),
  });

  const analysis = analyze.data?.payload;
  const itemCount = items.length;

  return (
    <div className="space-y-4">
      <Card className="border-brand-200 bg-brand-50/40 dark:bg-brand-900/20 dark:border-brand-900">
        <div className="flex items-start gap-3">
          <Salad className="size-5 text-brand-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <CardTitle>{t.daily.title}</CardTitle>
            <CardSubtle>{t.daily.subtitle}</CardSubtle>
          </div>
        </div>
      </Card>

      {/* Single, prominent analyze button — only runs when clicked */}
      <Card className="border-brand-300 bg-brand-50/30 dark:bg-brand-900/20 dark:border-brand-900">
        <div className="flex items-center gap-3">
          <Sparkles className="size-5 shrink-0 text-brand-600" />
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold leading-snug">
              {analysis ? t.daily.refreshAnalysis : t.daily.aiAnalysis}
            </h3>
            <p className="text-xs text-surface-500">
              {itemCount === 0
                ? lang === "he"
                  ? "אין פריטים היום עדיין — הוסף/י מאכל בלשונית 'היום'."
                  : "No items today yet — add a meal in the Today tab."
                : lang === "he"
                ? `${itemCount} פריטים מוכנים לניתוח`
                : `${itemCount} items ready to analyze`}
            </p>
          </div>
          <Button
            onClick={() => analyze.mutate(true)}
            loading={analyze.isPending}
            disabled={itemCount === 0}
            size="md"
          >
            {analyze.isPending ? null : analysis ? (
              <RefreshCw className="size-4" />
            ) : (
              <Sparkles className="size-4" />
            )}
            {analyze.isPending
              ? t.daily.aiAnalyzing
              : analysis
              ? t.daily.refreshAnalysis
              : t.daily.aiAnalysis}
          </Button>
        </div>
      </Card>

      {analyze.isError ? (
        <Card className="text-sm text-danger">
          {(analyze.error as Error)?.message ?? t.common.error}
        </Card>
      ) : null}

      {/* Analysis result */}
      {analysis ? <DayAnalysisCard payload={analysis} /> : null}

      {/* Items list */}
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <CardTitle>{t.daily.items}</CardTitle>
          <span className="text-xs text-surface-500 tabular">{itemCount}</span>
        </div>
        {itemsQ.isLoading ? (
          <div className="h-20 animate-pulse rounded-xl bg-surface-100 dark:bg-surface-800" />
        ) : itemCount === 0 ? (
          <p className="text-sm text-surface-500">{t.daily.noItems}</p>
        ) : (
          <ul className="space-y-2">
            {items.map((it) => {
              const isMeal = it.source === "meal";
              return (
                <li
                  key={`${it.source ?? "intake"}-${it.id}`}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border border-surface-200 px-3 py-2.5 dark:border-surface-800",
                    isMeal && "bg-surface-50/60 dark:bg-surface-900/40",
                  )}
                  style={
                    it.color
                      ? { borderInlineStartColor: it.color, borderInlineStartWidth: 4 }
                      : undefined
                  }
                >
                  <div className="shrink-0">
                    {it.kind === "drink" ? (
                      <GlassWater className="size-5 text-brand-500" />
                    ) : (
                      <Salad className="size-5 text-success" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{it.name}</span>
                      {isMeal ? (
                        <span
                          className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-medium text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                          title={lang === "he" ? "נמשך מלשונית 'היום'" : "Pulled from the Today tab"}
                        >
                          <Lock className="size-3" />
                          {lang === "he" ? "מהיום" : "Today"}
                        </span>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-surface-500">
                      {it.qty_value ? (
                        <span className="tabular">
                          {it.qty_value} {it.qty_unit}
                        </span>
                      ) : null}
                      {isMeal && it.calories ? (
                        <span className="tabular">{Math.round(it.calories)} kcal</span>
                      ) : null}
                      {isMeal && it.protein ? (
                        <span className="tabular">P {Math.round(it.protein)}g</span>
                      ) : null}
                      {it.consumed_at ? (
                        <span className="tabular">
                          {new Date(it.consumed_at).toLocaleTimeString(
                            lang === "he" ? "he-IL" : "en-US",
                            { hour: "2-digit", minute: "2-digit" },
                          )}
                        </span>
                      ) : null}
                      {it.category ? <span>{it.category}</span> : null}
                    </div>
                    {it.notes && !isMeal ? (
                      <p className="mt-1 text-xs text-surface-500 line-clamp-2">{it.notes}</p>
                    ) : null}
                  </div>
                  {it.rating ? <RatingBadge rating={it.rating} size="sm" /> : null}
                  {isMeal ? (
                    <span
                      className="text-[10px] text-surface-400"
                      title={lang === "he" ? "ניתן לערוך בלשונית 'היום'" : "Edit in the Today tab"}
                    >
                      {lang === "he" ? "לעריכה: היום" : "Edit: Today"}
                    </span>
                  ) : (
                    <button
                      onClick={() => del.mutate(it.id)}
                      className="rounded-lg p-1.5 text-surface-400 hover:text-danger"
                      aria-label={t.common.delete}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}

function DayAnalysisCard({ payload }: { payload: DayAnalysisPayload }) {
  const { t } = useI18n();
  const tone =
    payload.status === "excellent"
      ? "border-success/40 bg-success/5"
      : payload.status === "balanced"
      ? "border-warn/40 bg-warn/5"
      : "border-danger/40 bg-danger/5";
  const statusLabel =
    payload.status === "excellent"
      ? t.daily.statusExcellent
      : payload.status === "balanced"
      ? t.daily.statusBalanced
      : t.daily.statusNeedsWork;

  const charts: { key: keyof DayAnalysisPayload["totals"]; label: string; unit: string }[] = [
    { key: "calories", label: t.daily.calories, unit: "kcal" },
    { key: "protein", label: t.daily.protein, unit: "g" },
    { key: "sugar", label: t.daily.sugar, unit: "g" },
    { key: "water", label: t.daily.water, unit: "ml" },
    { key: "fiber", label: t.daily.fiber, unit: "g" },
    { key: "omega3", label: t.daily.omega3, unit: "g" },
  ];

  return (
    <Card className={cn("space-y-4", tone)}>
      <div className="flex items-center gap-4">
        <RatingBadge rating={payload.score} size="lg" />
        <div>
          <div className="text-xs text-surface-500">{t.daily.score}</div>
          <h3 className="text-xl font-bold">{statusLabel}</h3>
          <p className="text-xs text-surface-500">{t.daily.scoreLabel}</p>
        </div>
      </div>

      <p className="text-sm leading-relaxed">{payload.summary}</p>

      {payload.warnings.length > 0 ? (
        <ul className="space-y-1.5">
          {payload.warnings.map((w, i) => (
            <li key={i} className="flex gap-2 text-sm">
              <span className="mt-1 size-1.5 shrink-0 rounded-full bg-warn" />
              <span>{w}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {payload.suggestions.length > 0 ? (
        <div>
          <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-surface-500">
            {t.daily.suggestions}
          </div>
          <ul className="space-y-1.5">
            {payload.suggestions.map((s, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <Check className="size-4 shrink-0 text-success" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-surface-500">
          {t.daily.chartsTitle}
        </div>
        <div className="space-y-3">
          {charts.map((c) => {
            const total = payload.totals[c.key] ?? 0;
            const target = payload.targets[c.key] ?? 0;
            const tone =
              target > 110 ? "danger" : target > 80 ? "success" : target > 50 ? "warn" : "brand";
            return (
              <div key={c.key}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium">{c.label}</span>
                  <span className="tabular text-surface-500">
                    {total.toFixed(0)} {c.unit} ({target.toFixed(0)}%)
                  </span>
                </div>
                <Progress value={target} max={120} tone={tone as any} />
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
