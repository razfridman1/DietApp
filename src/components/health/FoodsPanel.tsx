"use client";

// Unified "Foods" panel — merges what used to be the FoodRatingPanel and
// the HealthyVsUnhealthyPanel into one experience.
//
// One search input drives two flows:
//   1. **Browse** — typing instantly filters the curated 4-bucket guide below.
//   2. **AI deep analysis** — clicking the "AI" button runs the AI rater on the
//      typed text (great for foods missing from the curated list, or for a more
//      detailed breakdown including body impact + nutritional breakdown).

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Sparkles,
  Apple,
  ThumbsUp,
  ThumbsDown,
  Check,
  Trash2,
  History,
} from "lucide-react";
import { Card, CardSubtle, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { api } from "@/lib/client-api";
import { useI18n } from "@/lib/i18n/provider";
import { GUIDE_FOODS, GUIDE_CATEGORIES, type GuideFood, type GuideCategory } from "@/lib/health/foodGuide";
import type { FoodRatingPayload } from "@/lib/health/types";
import { RatingBadge } from "./RatingBadge";
import { ImpactBars } from "./ImpactBars";
import { cn } from "@/lib/utils";

interface HistoryItem {
  id: string;
  query: string;
  lang: "he" | "en";
  rating: number;
  grams: number | null;
  created_at: string;
}

// =====================  Buckets  =====================
type Bucket = "healthy" | "moderate" | "harmful" | "veryHarmful";
const BUCKETS: Bucket[] = ["healthy", "moderate", "harmful", "veryHarmful"];

function bucketOf(r: number): Bucket {
  if (r <= 3) return "healthy";
  if (r <= 5) return "moderate";
  if (r <= 7) return "harmful";
  return "veryHarmful";
}

function sortInBucket(b: Bucket, items: GuideFood[]): GuideFood[] {
  if (b === "veryHarmful") {
    return [...items].sort((a, b) => b.rating - a.rating); // worst first
  }
  return [...items].sort((a, b) => a.rating - b.rating);
}

const BUCKET_TONE: Record<Bucket, { header: string; chipActive: string }> = {
  healthy:     { header: "bg-emerald-500 text-white", chipActive: "border-emerald-500 bg-emerald-500 text-white" },
  moderate:    { header: "bg-amber-500 text-white",   chipActive: "border-amber-500 bg-amber-500 text-white"     },
  harmful:     { header: "bg-orange-500 text-white",  chipActive: "border-orange-500 bg-orange-500 text-white"   },
  veryHarmful: { header: "bg-red-500 text-white",     chipActive: "border-red-500 bg-red-500 text-white"         },
};

// =====================  Severity (6 tiers, used in AI result card)  ===========
type Severity =
  | "veryHealthy"
  | "healthy"
  | "moderate"
  | "harmful"
  | "veryHarmful"
  | "doNotConsume";

function severityFromRating(r: number): Severity {
  if (r <= 1) return "veryHealthy";
  if (r <= 3) return "healthy";
  if (r <= 5) return "moderate";
  if (r <= 7) return "harmful";
  if (r <= 9) return "veryHarmful";
  return "doNotConsume";
}

const SEVERITY_TONE: Record<Severity, { bg: string; outerBorder: string; outerBg: string }> = {
  veryHealthy:  { bg: "bg-emerald-500", outerBorder: "border-emerald-300/60", outerBg: "bg-emerald-50/60 dark:bg-emerald-900/20" },
  healthy:      { bg: "bg-lime-500",    outerBorder: "border-lime-300/60",    outerBg: "bg-lime-50/60 dark:bg-lime-900/20"       },
  moderate:     { bg: "bg-amber-500",   outerBorder: "border-amber-300/60",   outerBg: "bg-amber-50/60 dark:bg-amber-900/20"     },
  harmful:      { bg: "bg-orange-500",  outerBorder: "border-orange-300/60",  outerBg: "bg-orange-50/60 dark:bg-orange-900/20"   },
  veryHarmful:  { bg: "bg-red-500",     outerBorder: "border-red-300/60",     outerBg: "bg-red-50/60 dark:bg-red-900/20"         },
  doNotConsume: { bg: "bg-red-700",     outerBorder: "border-red-400/70",     outerBg: "bg-red-50/60 dark:bg-red-900/20"         },
};

// =============================================================================

export function FoodsPanel() {
  const { t, lang } = useI18n();
  const qc = useQueryClient();

  const [q, setQ] = useState("");
  const [grams, setGrams] = useState("");
  const [bucketFilter, setBucketFilter] = useState<Bucket | "all">("all");
  const [cat, setCat] = useState<GuideCategory | "all">("all");
  const [aiResult, setAiResult] = useState<FoodRatingPayload | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  // ----- AI analyse -----
  const analyze = useMutation({
    mutationFn: (vars: { query: string; grams?: number }) =>
      api.post<{ payload: FoodRatingPayload; cached: boolean }>("/api/health/rate-food", {
        query: vars.query,
        grams: vars.grams,
        lang,
      }),
    onSuccess: (data) => {
      setAiResult(data.payload);
      setAiError(null);
      qc.invalidateQueries({ queryKey: ["health", "food-history"] });
    },
    onError: (e: any) => setAiError(e?.message || "error"),
  });

  function runAI() {
    setAiError(null);
    const query = q.trim();
    if (!query) return;
    const gramsNum = grams ? Number(grams) : undefined;
    analyze.mutate({ query, grams: gramsNum && gramsNum > 0 ? gramsNum : undefined });
  }

  // ----- AI history -----
  const historyQ = useQuery({
    queryKey: ["health", "food-history"],
    queryFn: () => api.get<{ items: HistoryItem[] }>("/api/health/food-history"),
  });

  const deleteHistory = useMutation({
    mutationFn: (id: string) => api.del(`/api/health/food-history?id=${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["health", "food-history"] }),
  });

  function repeatHistory(item: HistoryItem) {
    setQ(item.query);
    setGrams(item.grams ? String(item.grams) : "");
    analyze.mutate({ query: item.query, grams: item.grams ?? undefined });
  }

  // ----- Curated browse filtering -----
  const filtered = useMemo(() => {
    const norm = q.trim().toLowerCase();
    return GUIDE_FOODS.filter((f) => {
      if (cat !== "all" && f.category !== cat) return false;
      if (bucketFilter !== "all" && bucketOf(f.rating) !== bucketFilter) return false;
      if (!norm) return true;
      return (
        f.name.he.toLowerCase().includes(norm) ||
        f.name.en.toLowerCase().includes(norm)
      );
    });
  }, [q, bucketFilter, cat]);

  const grouped = useMemo(() => {
    const g: Record<Bucket, GuideFood[]> = {
      healthy: [],
      moderate: [],
      harmful: [],
      veryHarmful: [],
    };
    for (const f of filtered) g[bucketOf(f.rating)].push(f);
    for (const b of BUCKETS) g[b] = sortInBucket(b, g[b]);
    return g;
  }, [filtered]);

  const flatList = useMemo(() => {
    if (bucketFilter === "all") return filtered;
    return sortInBucket(bucketFilter, filtered);
  }, [filtered, bucketFilter]);

  return (
    <div className="space-y-3">
      {/* Header */}
      <Card className="border-brand-200 bg-brand-50/40 py-3 dark:bg-brand-900/20 dark:border-brand-900">
        <div className="flex items-start gap-2">
          <Apple className="size-4 text-brand-600 mt-0.5 shrink-0" />
          <div>
            <CardTitle className="text-sm">{t.tabs.foods}</CardTitle>
            <CardSubtle className="text-xs">{t.foodRating.subtitle}</CardSubtle>
          </div>
        </div>
      </Card>

      {/* Search + AI bar */}
      <Card className="space-y-2 p-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t.foodRating.placeholder}
              className="h-10 text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter" && q.trim()) {
                  e.preventDefault();
                  runAI();
                }
              }}
            />
            <Search className="pointer-events-none absolute top-1/2 -translate-y-1/2 size-4 text-surface-400 ltr:right-3 rtl:left-3" />
          </div>
          <Button
            size="md"
            onClick={runAI}
            disabled={!q.trim() || analyze.isPending}
            loading={analyze.isPending}
            title={t.foodRating.analyze}
          >
            <Sparkles className="size-4" />
            {analyze.isPending ? t.foodRating.analyzing : "AI"}
          </Button>
        </div>

        {/* Optional grams input — collapsed inline */}
        <div className="flex items-center gap-2">
          <Label htmlFor="foods-grams" className="!mb-0 text-xs whitespace-nowrap text-surface-500">
            {t.foodRating.grams}
          </Label>
          <Input
            id="foods-grams"
            type="number"
            inputMode="numeric"
            min={1}
            max={5000}
            step={10}
            placeholder="100"
            value={grams}
            onChange={(e) => setGrams(e.target.value)}
            className="h-8 max-w-[110px] text-sm"
          />
          <span className="text-[10px] text-surface-500 truncate">
            ({t.common.optional})
          </span>
        </div>

        {/* Examples */}
        <div className="flex flex-wrap gap-1">
          {t.foodRating.examplesList.slice(0, 8).map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => {
                setQ(ex);
              }}
              className="rounded-full bg-surface-100 px-2.5 py-1 text-[11px] hover:bg-surface-200 dark:bg-surface-800 dark:hover:bg-surface-700"
            >
              {ex}
            </button>
          ))}
        </div>
      </Card>

      {aiError ? <Card className="text-sm text-danger">{aiError}</Card> : null}

      {/* AI result — appears at the top when available */}
      {aiResult ? <FoodResultCard payload={aiResult} onDismiss={() => setAiResult(null)} /> : null}

      {/* Bucket + category filters */}
      <Card className="space-y-2 p-3">
        <div className="grid grid-cols-5 gap-1">
          <BucketChip
            label={lang === "he" ? "הכל" : "All"}
            active={bucketFilter === "all"}
            onClick={() => setBucketFilter("all")}
          />
          {BUCKETS.map((b) => (
            <BucketChip
              key={b}
              label={t.foodRating.severityLabels[b]}
              active={bucketFilter === b}
              onClick={() => setBucketFilter(b)}
              bucket={b}
            />
          ))}
        </div>

        <div className="-mx-3 overflow-x-auto px-3">
          <div className="flex w-max gap-1">
            <CategoryChip active={cat === "all"} onClick={() => setCat("all")} label={t.guide.categoryAll} />
            {GUIDE_CATEGORIES.map((c) => (
              <CategoryChip
                key={c}
                active={cat === c}
                onClick={() => setCat(c)}
                label={t.guide.categories[c]}
              />
            ))}
          </div>
        </div>
      </Card>

      {/* Browse view */}
      {filtered.length === 0 ? (
        <Card className="space-y-2 text-sm">
          <p className="text-surface-500">
            {lang === "he"
              ? "לא נמצא בדירוגים המוכנים. רוצה ניתוח AI מלא?"
              : "Not in the curated list. Want a full AI analysis?"}
          </p>
          {q.trim() ? (
            <Button onClick={runAI} loading={analyze.isPending} className="w-full">
              <Sparkles className="size-4" />
              {t.foodRating.analyze}
            </Button>
          ) : null}
        </Card>
      ) : bucketFilter === "all" ? (
        <div className="-mx-4 overflow-x-auto px-4 pb-2">
          <div className="flex gap-1.5">
            {BUCKETS.map((b) => (
              <CompactColumn
                key={b}
                title={t.foodRating.severityLabels[b]}
                tone={BUCKET_TONE[b].header}
                items={grouped[b]}
              />
            ))}
          </div>
        </div>
      ) : (
        <ul className="space-y-1.5">
          {flatList.map((f) => (
            <DetailedRow key={f.id} food={f} />
          ))}
        </ul>
      )}

      {/* AI search history (collapsible) */}
      <Card className="p-3">
        <button
          onClick={() => setHistoryOpen(!historyOpen)}
          className="flex w-full items-center gap-2 text-start"
        >
          <History className="size-4 text-surface-500" />
          <h3 className="font-semibold text-xs flex-1">
            {t.foodRating.history}
          </h3>
          <span className="text-[10px] text-surface-500 tabular">
            {historyQ.data?.items?.length ?? 0}
          </span>
        </button>

        {historyOpen ? (
          historyQ.isLoading ? (
            <div className="mt-2 h-10 animate-pulse rounded-xl bg-surface-100 dark:bg-surface-800" />
          ) : (historyQ.data?.items?.length ?? 0) === 0 ? (
            <p className="mt-2 text-xs text-surface-500">{t.foodRating.historyEmpty}</p>
          ) : (
            <ul className="mt-2 space-y-1">
              {historyQ.data!.items.map((it) => (
                <li
                  key={it.id}
                  className="flex items-center gap-2 rounded-lg border border-surface-200 px-2 py-1.5 dark:border-surface-800"
                >
                  <RatingBadge rating={it.rating} size="sm" />
                  <button
                    className="flex-1 text-start text-xs font-medium hover:text-brand-600 truncate"
                    onClick={() => repeatHistory(it)}
                  >
                    {it.query}
                    {it.grams ? (
                      <span className="ms-1.5 text-[10px] text-surface-500 tabular">
                        {it.grams}g
                      </span>
                    ) : null}
                  </button>
                  <button
                    onClick={() => deleteHistory.mutate(it.id)}
                    className="rounded p-1 text-surface-400 hover:text-danger"
                    aria-label={t.common.delete}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )
        ) : null}
      </Card>
    </div>
  );
}

// =====================  AI Result card  =====================

function FoodResultCard({
  payload,
  onDismiss,
}: {
  payload: FoodRatingPayload;
  onDismiss: () => void;
}) {
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
    <Card className={cn("space-y-3 border", sev.outerBorder, sev.outerBg)}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <RatingBadge rating={payload.rating} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="text-[10px] uppercase tracking-wide text-surface-500">
            {t.foodRating.ratingLabel}
          </div>
          <h2 className="text-lg font-bold leading-tight truncate">{payload.query}</h2>
          <span
            className={cn(
              "mt-0.5 inline-block rounded-full px-2 py-0.5 text-[11px] font-bold text-white",
              sev.bg,
            )}
          >
            {sevLabel}
          </span>
        </div>
        <button
          onClick={onDismiss}
          className="rounded-full p-1 text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800"
          aria-label={t.common.close}
        >
          ×
        </button>
      </div>

      {payload.overview ? (
        <p className="text-xs leading-relaxed text-surface-700 dark:text-surface-200">
          {payload.overview}
        </p>
      ) : null}

      {/* Pros + Cons */}
      <div className="grid gap-2 sm:grid-cols-2">
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

      {/* Body impact */}
      <Section title={t.foodRating.effects}>
        <ImpactBars
          labels={t.foodRating.impactOnLabel}
          effects={payload.effects}
          levelLabels={t.foodRating.impactLevels}
        />
      </Section>

      {/* Nutrition */}
      <Section title={t.foodRating.nutrition}>
        <div className="grid grid-cols-3 gap-1.5 text-center">
          <NutCell label={t.foodRating.calories} value={payload.nutrition.kcal} unit="kcal" />
          <NutCell label={t.foodRating.protein} value={payload.nutrition.protein} unit="g" />
          <NutCell label={t.foodRating.carbs} value={payload.nutrition.carbs} unit="g" />
          <NutCell label={t.foodRating.sugar} value={payload.nutrition.sugar} unit="g" />
          <NutCell label={t.foodRating.fats} value={payload.nutrition.fats} unit="g" />
          <NutCell label={t.foodRating.fiber} value={payload.nutrition.fiber} unit="g" />
        </div>
      </Section>

      {/* Alternatives */}
      {payload.alternatives.length > 0 ? (
        <Section title={t.foodRating.alternatives}>
          <ul className="flex flex-wrap gap-1">
            {payload.alternatives.map((a, i) => (
              <li
                key={i}
                className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] text-emerald-700 dark:text-emerald-300"
              >
                {a}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {/* Add buttons */}
      <div className="flex gap-2 pt-1">
        <Button
          onClick={() => addTo.mutate("healthy")}
          variant="secondary"
          size="sm"
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
          size="sm"
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
          "mb-1 text-[10px] font-semibold uppercase tracking-wide",
          tone === "good"
            ? "text-emerald-700 dark:text-emerald-300"
            : tone === "bad"
            ? "text-red-700 dark:text-red-300"
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
    <div className="rounded-lg bg-surface-100 px-1.5 py-1.5 dark:bg-surface-800">
      <div className="text-[10px] text-surface-500">{label}</div>
      <div className="text-sm font-bold tabular">
        {value.toFixed(value < 10 ? 1 : 0)}
        <span className="ms-0.5 text-[10px] font-normal text-surface-500">{unit}</span>
      </div>
    </div>
  );
}

// =====================  Browse columns  =====================

function CompactColumn({
  title,
  tone,
  items,
}: {
  title: string;
  tone: string;
  items: GuideFood[];
}) {
  return (
    <div className="flex w-[150px] shrink-0 flex-col gap-1">
      <div
        className={cn(
          "rounded-lg px-1.5 py-1 text-center text-[11px] font-bold leading-tight",
          tone,
        )}
      >
        <div className="truncate">{title}</div>
        <div className="opacity-80 tabular text-[10px]">{items.length}</div>
      </div>
      <ul className="space-y-1">
        {items.length === 0 ? (
          <li className="text-center text-[10px] text-surface-400 py-1">—</li>
        ) : (
          items.map((f) => <CompactRow key={f.id} food={f} />)
        )}
      </ul>
    </div>
  );
}

function CompactRow({ food }: { food: GuideFood }) {
  const { lang } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <li>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full flex items-center gap-1 rounded-md border border-surface-200 bg-white px-1 py-0.5 text-start dark:border-surface-800 dark:bg-surface-900",
          "hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors",
        )}
      >
        <RatingBadge rating={food.rating} size="sm" />
        <span className="min-w-0 flex-1 truncate text-[10px] font-medium leading-tight">
          {food.name[lang]}
        </span>
      </button>

      {open ? <ExpandedFood food={food} /> : null}
    </li>
  );
}

function DetailedRow({ food }: { food: GuideFood }) {
  const { t, lang } = useI18n();
  const benefits = food.benefits ? food.benefits[lang] : [];
  const harms = food.harms ? food.harms[lang] : [];
  const note = food.note ? food.note[lang] : null;

  return (
    <li className="rounded-xl border border-surface-200 bg-white p-2.5 dark:border-surface-800 dark:bg-surface-900">
      <div className="flex items-center gap-2">
        <RatingBadge rating={food.rating} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold leading-tight truncate">{food.name[lang]}</div>
          <div className="text-[10px] text-surface-500">
            {t.guide.categories[food.category]}
          </div>
        </div>
      </div>
      {benefits.length > 0 ? (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {benefits.map((b, i) => (
            <span key={i} className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] text-emerald-700 dark:text-emerald-300">
              {b}
            </span>
          ))}
        </div>
      ) : null}
      {harms.length > 0 ? (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {harms.map((h, i) => (
            <span key={i} className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] text-red-700 dark:text-red-300">
              {h}
            </span>
          ))}
        </div>
      ) : null}
      {note ? (
        <p className="mt-1.5 text-[11px] text-surface-600 dark:text-surface-300 leading-snug">
          <Sparkles className="me-1 inline size-3 text-brand-500" />
          {note}
        </p>
      ) : null}
      <div className="mt-2 flex gap-1.5">
        <AddBtn food={food} which="healthy" />
        <AddBtn food={food} which="unhealthy" />
      </div>
    </li>
  );
}

function ExpandedFood({ food }: { food: GuideFood }) {
  const { t, lang } = useI18n();
  const benefits = food.benefits ? food.benefits[lang] : [];
  const harms = food.harms ? food.harms[lang] : [];
  const note = food.note ? food.note[lang] : null;

  return (
    <div className="mt-1 rounded-md border border-surface-200 bg-surface-50 p-1.5 text-[10px] dark:border-surface-800 dark:bg-surface-800/50">
      <div className="text-[9px] font-medium text-surface-500 mb-1">
        {t.guide.categories[food.category]}
      </div>
      {benefits.length > 0 ? (
        <ul className="mb-1 flex flex-wrap gap-0.5">
          {benefits.map((b, i) => (
            <li key={i} className="rounded bg-emerald-500/15 px-1 py-0.5 text-[9px] text-emerald-700 dark:text-emerald-300">
              {b}
            </li>
          ))}
        </ul>
      ) : null}
      {harms.length > 0 ? (
        <ul className="mb-1 flex flex-wrap gap-0.5">
          {harms.map((h, i) => (
            <li key={i} className="rounded bg-red-500/15 px-1 py-0.5 text-[9px] text-red-700 dark:text-red-300">
              {h}
            </li>
          ))}
        </ul>
      ) : null}
      {note ? (
        <p className="mb-1 leading-snug text-surface-600 dark:text-surface-300">
          {note}
        </p>
      ) : null}
      <div className="flex flex-col gap-0.5">
        <AddBtn food={food} which="healthy" small />
        <AddBtn food={food} which="unhealthy" small />
      </div>
    </div>
  );
}

function AddBtn({
  food,
  which,
  small,
}: {
  food: GuideFood;
  which: "healthy" | "unhealthy";
  small?: boolean;
}) {
  const { t, lang } = useI18n();
  const benefits = food.benefits ? food.benefits[lang] : [];
  const harms = food.harms ? food.harms[lang] : [];
  const note = food.note ? food.note[lang] : null;

  const m = useMutation({
    mutationFn: async () => {
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
        (which === "healthy" ? benefits.slice(0, 3).join(" · ") : harms.slice(0, 3).join(" · ")) ||
        (note ?? "");
      await api.post(`/api/health/lists/${list!.id}/items`, {
        name: food.name[lang],
        rating: food.rating,
        reason: reason || null,
      });
    },
  });

  const Icon = which === "healthy" ? ThumbsUp : ThumbsDown;
  const label = which === "healthy" ? t.foodRating.addToHealthy : t.foodRating.addToUnhealthy;
  const okClass =
    which === "healthy"
      ? "bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300"
      : "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300";

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        m.mutate();
      }}
      disabled={m.isPending || m.isSuccess}
      className={cn(
        "inline-flex flex-1 items-center justify-center gap-1 rounded border font-medium transition-colors disabled:opacity-60",
        small ? "h-5 px-1 text-[9px]" : "h-7 px-2 text-[11px]",
        m.isSuccess
          ? okClass
          : "border-surface-200 bg-white text-surface-700 hover:bg-surface-100 dark:border-surface-800 dark:bg-surface-900 dark:text-surface-200 dark:hover:bg-surface-800",
      )}
    >
      {m.isSuccess ? <Check className="size-3" /> : <Icon className="size-3" />}
      <span className="truncate">{m.isSuccess ? t.foodRating.addedToList : label}</span>
    </button>
  );
}

function BucketChip({
  label,
  active,
  onClick,
  bucket,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  bucket?: Bucket;
}) {
  const activeTone = bucket
    ? BUCKET_TONE[bucket].chipActive
    : "border-brand-600 bg-brand-600 text-white";
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-lg border px-1.5 h-7 text-[11px] font-semibold whitespace-nowrap transition-colors",
        active
          ? activeTone
          : "border-surface-200 bg-white text-surface-700 hover:bg-surface-100 dark:border-surface-800 dark:bg-surface-900 dark:text-surface-200 dark:hover:bg-surface-800",
      )}
    >
      {label}
    </button>
  );
}

function CategoryChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-2.5 h-7 text-[11px] font-medium whitespace-nowrap transition-colors",
        active
          ? "border-brand-600 bg-brand-600 text-white"
          : "border-surface-200 bg-white text-surface-700 hover:bg-surface-100 dark:border-surface-800 dark:bg-surface-900 dark:text-surface-200 dark:hover:bg-surface-800",
      )}
    >
      {label}
    </button>
  );
}
