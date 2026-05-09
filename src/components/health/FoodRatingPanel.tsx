"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Sparkles,
  Trash2,
  History,
  Apple,
  ThumbsUp,
  ThumbsDown,
  Check,
} from "lucide-react";
import { Card, CardSubtle, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { api } from "@/lib/client-api";
import { useI18n } from "@/lib/i18n/provider";
import { RatingBadge } from "./RatingBadge";
import { ImpactBars } from "./ImpactBars";
import type { FoodRatingPayload } from "@/lib/health/types";
import { cn } from "@/lib/utils";

interface HistoryItem {
  id: string;
  query: string;
  lang: "he" | "en";
  rating: number;
  grams: number | null;
  created_at: string;
}

type SeverityKey =
  | "veryHealthy"
  | "healthy"
  | "moderate"
  | "harmful"
  | "veryHarmful"
  | "doNotConsume";

function severityFromRating(r: number): SeverityKey {
  if (r <= 1) return "veryHealthy";
  if (r <= 3) return "healthy";
  if (r <= 5) return "moderate";
  if (r <= 7) return "harmful";
  if (r <= 9) return "veryHarmful";
  return "doNotConsume";
}

const SEVERITY_TONE: Record<SeverityKey, { bg: string; text: string; outerBorder: string; outerBg: string }> = {
  veryHealthy: { bg: "bg-emerald-500", text: "text-white", outerBorder: "border-emerald-300/60", outerBg: "bg-emerald-50/60 dark:bg-emerald-900/20" },
  healthy:     { bg: "bg-lime-500",    text: "text-white", outerBorder: "border-lime-300/60",    outerBg: "bg-lime-50/60 dark:bg-lime-900/20"       },
  moderate:    { bg: "bg-amber-500",   text: "text-white", outerBorder: "border-amber-300/60",   outerBg: "bg-amber-50/60 dark:bg-amber-900/20"     },
  harmful:     { bg: "bg-orange-500",  text: "text-white", outerBorder: "border-orange-300/60",  outerBg: "bg-orange-50/60 dark:bg-orange-900/20"   },
  veryHarmful: { bg: "bg-red-500",     text: "text-white", outerBorder: "border-red-300/60",     outerBg: "bg-red-50/60 dark:bg-red-900/20"         },
  doNotConsume:{ bg: "bg-red-700",     text: "text-white", outerBorder: "border-red-400/70",     outerBg: "bg-red-50/60 dark:bg-red-900/20"         },
};

export function FoodRatingPanel() {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [grams, setGrams] = useState<string>("");
  const [result, setResult] = useState<FoodRatingPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  const historyQ = useQuery({
    queryKey: ["health", "food-history"],
    queryFn: () => api.get<{ items: HistoryItem[] }>("/api/health/food-history"),
  });

  const analyze = useMutation({
    mutationFn: (vars: { query: string; grams?: number }) =>
      api.post<{ payload: FoodRatingPayload; cached: boolean }>("/api/health/rate-food", {
        query: vars.query,
        grams: vars.grams,
        lang,
      }),
    onSuccess: (data) => {
      setResult(data.payload);
      setError(null);
      qc.invalidateQueries({ queryKey: ["health", "food-history"] });
    },
    onError: (e: any) => setError(e?.message || "error"),
  });

  const deleteHistory = useMutation({
    mutationFn: (id: string) => api.del(`/api/health/food-history?id=${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["health", "food-history"] }),
  });

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const query = q.trim();
    if (!query) return;
    const gramsNum = grams ? Number(grams) : undefined;
    analyze.mutate({ query, grams: gramsNum && gramsNum > 0 ? gramsNum : undefined });
  }

  function pickExample(name: string) {
    setQ(name);
    analyze.mutate({ query: name, grams: undefined });
  }

  function repeatHistory(item: HistoryItem) {
    setQ(item.query);
    setGrams(item.grams ? String(item.grams) : "");
    analyze.mutate({ query: item.query, grams: item.grams ?? undefined });
  }

  return (
    <div className="space-y-4">
      <Card className="border-brand-200 bg-brand-50/40 dark:bg-brand-900/20 dark:border-brand-900">
        <div className="flex items-start gap-3">
          <Apple className="size-5 text-brand-600 mt-0.5 shrink-0" />
          <div>
            <CardTitle>{t.foodRating.title}</CardTitle>
            <CardSubtle>{t.foodRating.subtitle}</CardSubtle>
          </div>
        </div>
      </Card>

      <Card>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <Label htmlFor="food-q">{t.foodRating.placeholder}</Label>
            <div className="relative">
              <Input
                id="food-q"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t.foodRating.placeholder}
                autoComplete="off"
              />
              <Search className="pointer-events-none absolute top-1/2 -translate-y-1/2 size-4 text-surface-400 ltr:right-3 rtl:left-3" />
            </div>
          </div>
          <div>
            <Label htmlFor="food-grams">
              {t.foodRating.grams}{" "}
              <span className="text-xs font-normal text-surface-500">({t.common.optional})</span>
            </Label>
            <Input
              id="food-grams"
              type="number"
              inputMode="numeric"
              min={1}
              max={5000}
              step={10}
              placeholder="100"
              value={grams}
              onChange={(e) => setGrams(e.target.value)}
            />
          </div>
          <Button type="submit" loading={analyze.isPending} className="w-full">
            <Sparkles className="size-4" />
            {analyze.isPending ? t.foodRating.analyzing : t.foodRating.analyze}
          </Button>
        </form>

        {/* Examples */}
        <div className="mt-4 border-t border-surface-200 pt-3 dark:border-surface-800">
          <p className="mb-2 text-xs font-medium text-surface-500">{t.foodRating.examples}</p>
          <div className="flex flex-wrap gap-1.5">
            {t.foodRating.examplesList.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => pickExample(ex)}
                className="rounded-full bg-surface-100 px-2.5 py-1 text-xs hover:bg-surface-200
                           dark:bg-surface-800 dark:hover:bg-surface-700"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {error ? <Card className="text-sm text-danger">{error}</Card> : null}

      {/* Result */}
      {result ? <FoodResultCard payload={result} /> : null}

      {/* History */}
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="size-4 text-surface-500" />
            <h3 className="font-semibold text-sm">{t.foodRating.history}</h3>
          </div>
        </div>
        {historyQ.isLoading ? (
          <div className="h-12 animate-pulse rounded-xl bg-surface-100 dark:bg-surface-800" />
        ) : (historyQ.data?.items?.length ?? 0) === 0 ? (
          <p className="text-sm text-surface-500">{t.foodRating.historyEmpty}</p>
        ) : (
          <ul className="space-y-1.5">
            {historyQ.data!.items.map((it) => (
              <li
                key={it.id}
                className="flex items-center gap-3 rounded-xl border border-surface-200 px-3 py-2
                           dark:border-surface-800"
              >
                <RatingBadge rating={it.rating} size="sm" />
                <button
                  className="flex-1 text-start text-sm font-medium hover:text-brand-600"
                  onClick={() => repeatHistory(it)}
                >
                  {it.query}
                  {it.grams ? (
                    <span className="ms-2 text-xs text-surface-500 tabular">{it.grams}g</span>
                  ) : null}
                </button>
                <button
                  onClick={() => deleteHistory.mutate(it.id)}
                  className="rounded-lg p-1.5 text-surface-400 hover:text-danger"
                  aria-label={t.common.delete}
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function FoodResultCard({ payload }: { payload: FoodRatingPayload }) {
  const { t, lang } = useI18n();
  const sevKey = severityFromRating(payload.rating);
  const sev = SEVERITY_TONE[sevKey];
  const sevLabel = t.foodRating.severityLabels[sevKey];
  const [addedTo, setAddedTo] = useState<"healthy" | "unhealthy" | null>(null);

  const addTo = useMutation({
    mutationFn: async (which: "healthy" | "unhealthy") => {
      const targetType = which === "healthy" ? "recommended" : "avoid";
      const targetName =
        lang === "he"
          ? which === "healthy"
            ? "רשימת בריאים"
            : "רשימת לא בריאים"
          : which === "healthy"
          ? "Healthy list"
          : "Unhealthy list";

      const lists = await api.get<{ lists: { id: string; list_type: string; name: string }[] }>(
        "/api/health/lists",
      );
      let list = lists.lists.find((l) => l.list_type === targetType);
      if (!list) {
        const created = await api.post<{ list: { id: string } }>("/api/health/lists", {
          name: targetName,
          list_type: targetType,
        });
        list = created.list as any;
      }
      const reason =
        which === "healthy"
          ? payload.pros.slice(0, 3).join(" · ") || payload.overview.slice(0, 240)
          : payload.cons.slice(0, 3).join(" · ") || payload.overview.slice(0, 240);
      await api.post(`/api/health/lists/${list!.id}/items`, {
        name: payload.query,
        rating: payload.rating,
        reason: reason || null,
      });
    },
    onSuccess: (_d, which) => setAddedTo(which),
  });

  return (
    <Card className={cn("space-y-4 border", sev.outerBorder, sev.outerBg)}>
      {/* Header */}
      <div className="flex items-center gap-4">
        <RatingBadge rating={payload.rating} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="text-xs text-surface-500">{t.foodRating.ratingLabel}</div>
          <h2 className="text-xl font-bold leading-snug truncate">{payload.query}</h2>
          <span
            className={cn(
              "mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-bold",
              sev.bg,
              sev.text,
            )}
          >
            {sevLabel}
          </span>
        </div>
      </div>

      {/* Compact overview */}
      {payload.overview ? (
        <p className="text-sm leading-relaxed text-surface-700 dark:text-surface-200">
          {payload.overview}
        </p>
      ) : null}

      {/* Pros + Cons in compact 2-col */}
      <div className="grid gap-3 sm:grid-cols-2">
        {payload.pros.length > 0 ? (
          <Section title={t.foodRating.pros} tone="good">
            <ul className="space-y-1 text-xs">
              {payload.pros.map((p, i) => (
                <li key={i} className="flex gap-1.5">
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-emerald-500" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </Section>
        ) : null}
        {payload.cons.length > 0 ? (
          <Section title={t.foodRating.cons} tone="bad">
            <ul className="space-y-1 text-xs">
              {payload.cons.map((p, i) => (
                <li key={i} className="flex gap-1.5">
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-red-500" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </Section>
        ) : null}
      </div>

      {/* Body impact — coloured grid */}
      <Section title={t.foodRating.effects}>
        <ImpactBars
          labels={t.foodRating.impactOnLabel}
          effects={payload.effects}
          levelLabels={t.foodRating.impactLevels}
        />
      </Section>

      {/* Nutrition (per 100 g/ml) */}
      <Section title={t.foodRating.nutrition}>
        <div className="grid grid-cols-3 gap-2 text-center">
          <NutCell label={t.foodRating.calories} value={payload.nutrition.kcal} unit="kcal" />
          <NutCell label={t.foodRating.protein} value={payload.nutrition.protein} unit="g" />
          <NutCell label={t.foodRating.carbs} value={payload.nutrition.carbs} unit="g" />
          <NutCell label={t.foodRating.sugar} value={payload.nutrition.sugar} unit="g" />
          <NutCell label={t.foodRating.fats} value={payload.nutrition.fats} unit="g" />
          <NutCell label={t.foodRating.fiber} value={payload.nutrition.fiber} unit="g" />
        </div>
      </Section>

      {/* Alternatives — only if exists */}
      {payload.alternatives.length > 0 ? (
        <Section title={t.foodRating.alternatives}>
          <ul className="flex flex-wrap gap-1.5">
            {payload.alternatives.map((a, i) => (
              <li
                key={i}
                className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs text-emerald-700 dark:text-emerald-300"
              >
                {a}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {/* Two add-to-list buttons */}
      <div className="flex gap-2 pt-1">
        <Button
          onClick={() => addTo.mutate("healthy")}
          variant="secondary"
          className={cn(
            "flex-1",
            addedTo === "healthy" && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
          )}
          disabled={addTo.isPending}
        >
          {addedTo === "healthy" ? <Check className="size-4" /> : <ThumbsUp className="size-4" />}
          {addedTo === "healthy" ? t.foodRating.addedToList : t.foodRating.addToHealthy}
        </Button>
        <Button
          onClick={() => addTo.mutate("unhealthy")}
          variant="secondary"
          className={cn(
            "flex-1",
            addedTo === "unhealthy" && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
          )}
          disabled={addTo.isPending}
        >
          {addedTo === "unhealthy" ? <Check className="size-4" /> : <ThumbsDown className="size-4" />}
          {addedTo === "unhealthy" ? t.foodRating.addedToList : t.foodRating.addToUnhealthy}
        </Button>
      </div>
    </Card>
  );
}

function Section({
  title,
  children,
  tone,
}: {
  title: string;
  children: React.ReactNode;
  tone?: "good" | "bad";
}) {
  return (
    <div>
      <div
        className={cn(
          "mb-1.5 text-xs font-semibold uppercase tracking-wide",
          tone === "good" ? "text-emerald-700 dark:text-emerald-300"
          : tone === "bad" ? "text-red-700 dark:text-red-300"
          : "text-surface-500",
        )}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function NutCell({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="rounded-xl bg-surface-100 p-2 dark:bg-surface-800">
      <div className="text-xs text-surface-500">{label}</div>
      <div className="text-base font-bold tabular">
        {value.toFixed(value < 10 ? 1 : 0)}
        <span className="ms-1 text-xs font-normal text-surface-500">{unit}</span>
      </div>
    </div>
  );
}
