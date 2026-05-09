"use client";

import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Search, Scale, Sparkles, ThumbsUp, ThumbsDown, Check } from "lucide-react";
import { Card, CardSubtle, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useI18n } from "@/lib/i18n/provider";
import { GUIDE_FOODS, GUIDE_CATEGORIES, type GuideFood, type GuideCategory } from "@/lib/health/foodGuide";
import { RatingBadge } from "./RatingBadge";
import { api } from "@/lib/client-api";
import { cn } from "@/lib/utils";

// 4 merged buckets:
//   healthy       (1-3)  → "בריא"        — sorted ascending (best on top)
//   moderate      (4-5)  → "בינוני"       — sorted ascending
//   harmful       (6-7)  → "פחות בריא"   — sorted ascending
//   veryHarmful   (8-10) → "מזיק"        — sorted DESCENDING (worst on top)
type Bucket = "healthy" | "moderate" | "harmful" | "veryHarmful";

const BUCKETS: Bucket[] = ["healthy", "moderate", "harmful", "veryHarmful"];

function bucketOf(r: number): Bucket {
  if (r <= 3) return "healthy";
  if (r <= 5) return "moderate";
  if (r <= 7) return "harmful";
  return "veryHarmful";
}

/** Sort items inside a bucket so the most extreme item is on top. */
function sortInBucket(b: Bucket, items: GuideFood[]): GuideFood[] {
  if (b === "veryHarmful") {
    return [...items].sort((a, b) => b.rating - a.rating); // worst first
  }
  return [...items].sort((a, b) => a.rating - b.rating); // healthier first
}

const BUCKET_TONE: Record<Bucket, { header: string; chipActive: string }> = {
  healthy:     { header: "bg-emerald-500 text-white", chipActive: "border-emerald-500 bg-emerald-500 text-white" },
  moderate:    { header: "bg-amber-500 text-white",   chipActive: "border-amber-500 bg-amber-500 text-white"     },
  harmful:     { header: "bg-orange-500 text-white",  chipActive: "border-orange-500 bg-orange-500 text-white"   },
  veryHarmful: { header: "bg-red-500 text-white",     chipActive: "border-red-500 bg-red-500 text-white"         },
};

export function HealthyVsUnhealthyPanel() {
  const { t, lang } = useI18n();
  const [q, setQ] = useState("");
  const [bucketFilter, setBucketFilter] = useState<Bucket | "all">("all");
  const [cat, setCat] = useState<GuideCategory | "all">("all");

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
    // Sort within each bucket per its rule.
    for (const b of BUCKETS) g[b] = sortInBucket(b, g[b]);
    return g;
  }, [filtered]);

  // Flat list for the single-bucket detailed view, sorted per bucket rule.
  const flatList = useMemo(() => {
    if (bucketFilter === "all") return filtered;
    return sortInBucket(bucketFilter, filtered);
  }, [filtered, bucketFilter]);

  return (
    <div className="space-y-3">
      <Card className="border-brand-200 bg-brand-50/40 py-3 dark:bg-brand-900/20 dark:border-brand-900">
        <div className="flex items-start gap-2">
          <Scale className="size-4 text-brand-600 mt-0.5 shrink-0" />
          <div>
            <CardTitle className="text-sm">{t.guide.title}</CardTitle>
            <CardSubtle className="text-xs">{t.guide.subtitle}</CardSubtle>
          </div>
        </div>
      </Card>

      <Card className="space-y-2 p-3">
        <div className="relative">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.guide.searchPlaceholder}
            className="h-9 text-sm"
          />
          <Search className="pointer-events-none absolute top-1/2 -translate-y-1/2 size-4 text-surface-400 ltr:right-3 rtl:left-3" />
        </div>

        {/* 7-chip bucket filter (All + 6 tiers), horizontal scroll on small screens */}
        <div className="-mx-3 overflow-x-auto px-3">
          <div className="flex w-max gap-1">
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

      {filtered.length === 0 ? (
        <Card className="text-sm text-surface-500">{t.common.placeholderEmpty}</Card>
      ) : bucketFilter === "all" ? (
        // 4 columns side-by-side. On mobile, horizontal scroll.
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
    </div>
  );
}

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
      {m.isSuccess ? <Icon className="size-3" /> : <Icon className="size-3" />}
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
        "rounded-lg border px-2 h-7 text-[11px] font-semibold whitespace-nowrap transition-colors",
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
