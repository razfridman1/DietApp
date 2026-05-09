"use client";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChefHat,
  Sparkles,
  Flame,
  RefreshCw,
  Clock,
  History,
  Trash2,
  ChevronDown,
} from "lucide-react";
import { TopBar } from "@/components/nav/TopBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { api } from "@/lib/client-api";
import { T } from "@/lib/constants";
import { fmtShortDay } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { MealIdea } from "@/lib/ai/mealIdeas";

interface HistoryEntry {
  id: string;
  max_calories: number;
  ideas: MealIdea[];
  created_at: string;
}

export default function MealIdeasPage() {
  const qc = useQueryClient();
  const [limitInput, setLimitInput] = useState<string>("");
  const [submittedLimit, setSubmittedLimit] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  // When non-null, we're displaying an entry from the history instead of fresh
  const [viewing, setViewing] = useState<{ ideas: MealIdea[]; limit: number } | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  const generate = useMutation({
    mutationFn: (maxCalories: number) =>
      api.post<{ ideas: MealIdea[] }>("/api/ai/meal-ideas", { maxCalories }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["meal-idea-history"] });
      setViewing(null); // freshly generated ideas take priority
    },
  });

  const historyQ = useQuery({
    queryKey: ["meal-idea-history"],
    queryFn: () =>
      api.get<{ items: HistoryEntry[] }>("/api/ai/meal-ideas/history"),
  });

  const deleteHistory = useMutation({
    mutationFn: (id: string) => api.del(`/api/ai/meal-ideas/history?id=${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["meal-idea-history"] }),
  });

  const clearAllHistory = useMutation({
    mutationFn: () => api.del("/api/ai/meal-ideas/history"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["meal-idea-history"] }),
  });

  // Active ideas: history view if set, otherwise the freshly-generated.
  const displayIdeas: MealIdea[] = viewing?.ideas ?? generate.data?.ideas ?? [];
  const displayLimit = viewing?.limit ?? submittedLimit;
  const isFreshGen = !viewing && generate.data;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    const n = Number(limitInput);
    if (!Number.isFinite(n) || n <= 0) {
      setFormError(T.mealIdeas.invalidLimit);
      return;
    }
    setSubmittedLimit(n);
    generate.mutate(n);
  }

  function loadHistory(entry: HistoryEntry) {
    setViewing({ ideas: entry.ideas, limit: entry.max_calories });
    setSubmittedLimit(entry.max_calories);
    setLimitInput(String(entry.max_calories));
    setHistoryOpen(false);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <>
      <TopBar title={T.mealIdeas.title} />
      <div className="space-y-4 pt-4">
        <Card className="border-brand-200 bg-brand-50/40 dark:bg-brand-900/20 dark:border-brand-900">
          <div className="flex items-start gap-3">
            <ChefHat className="size-5 text-brand-600 mt-0.5 shrink-0" />
            <div>
              <h3 className="font-semibold">{T.mealIdeas.title}</h3>
              <p className="text-sm text-surface-600 dark:text-surface-300">
                {T.mealIdeas.subtitle}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <form onSubmit={onSubmit} className="space-y-3">
            <div>
              <Label htmlFor="cal-limit">{T.mealIdeas.limitLabel}</Label>
              <Input
                id="cal-limit"
                type="number"
                inputMode="numeric"
                min={50}
                max={5000}
                step={10}
                placeholder={T.mealIdeas.limitPlaceholder}
                value={limitInput}
                onChange={(e) => setLimitInput(e.target.value)}
              />
            </div>
            {formError ? <p className="text-sm text-danger">{formError}</p> : null}
            <Button type="submit" loading={generate.isPending} className="w-full">
              <Sparkles className="size-4" />
              {generate.isPending ? T.mealIdeas.generating : T.mealIdeas.generate}
            </Button>
          </form>
        </Card>

        {generate.error ? (
          <Card className="text-sm text-danger">
            {(generate.error as Error).message || T.mealIdeas.error}
          </Card>
        ) : null}

        {generate.isPending ? (
          <ul className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <li key={i}>
                <Card className="h-28 animate-pulse" />
              </li>
            ))}
          </ul>
        ) : displayIdeas.length === 0 ? (
          !generate.isError ? (
            <Card className="text-sm text-surface-500 dark:text-surface-300">
              {T.mealIdeas.empty}
            </Card>
          ) : null
        ) : (
          <>
            <div className="flex items-center justify-between gap-2 px-1">
              <p className="text-sm text-surface-500 dark:text-surface-300">
                {displayIdeas.length} {T.mealIdeas.underLimit}
                {displayLimit ? ` ${displayLimit} ${T.dash.kcal}` : ""}
                {!isFreshGen && viewing ? (
                  <span className="ms-2 rounded-full bg-surface-100 px-2 py-0.5 text-[10px] dark:bg-surface-800">
                    {T.mealIdeas.history}
                  </span>
                ) : null}
              </p>
              {submittedLimit ? (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => generate.mutate(submittedLimit)}
                  loading={generate.isPending}
                >
                  <RefreshCw className="size-4" />
                  {T.mealIdeas.regenerate}
                </Button>
              ) : null}
            </div>
            <ul className="space-y-3">
              {displayIdeas.map((idea, i) => (
                <li key={`${idea.name}-${i}`}>
                  <Card>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold leading-snug">{idea.name}</h4>
                        {idea.description ? (
                          <p className="mt-1 text-sm text-surface-600 dark:text-surface-300 leading-relaxed">
                            {idea.description}
                          </p>
                        ) : null}
                        {/* Tags + prep time */}
                        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
                          {idea.prepTime ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
                              <Clock className="size-3" />
                              {idea.prepTime} {T.mealIdeas.minutesShort}
                            </span>
                          ) : null}
                          {idea.tags?.map((tag, j) => (
                            <span
                              key={j}
                              className="rounded-full bg-surface-100 px-2 py-0.5 text-surface-700 dark:bg-surface-800 dark:text-surface-200"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="shrink-0 rounded-xl bg-brand-50 px-3 py-2 text-center dark:bg-brand-900/30">
                        <div className="flex items-center justify-center gap-1 text-brand-700 dark:text-brand-300">
                          <Flame className="size-3.5" />
                          <span className="text-sm font-bold">{idea.calories}</span>
                        </div>
                        <div className="text-[10px] text-surface-500 dark:text-surface-400">
                          {T.dash.kcal}
                        </div>
                      </div>
                    </div>
                    {idea.ingredients?.length ? (
                      <div className="mt-3 border-t border-surface-200 pt-3 dark:border-surface-800">
                        <p className="mb-1.5 text-xs font-medium text-surface-500 dark:text-surface-400">
                          {T.mealIdeas.ingredients}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {idea.ingredients.map((ing, j) => (
                            <span
                              key={j}
                              className="rounded-full bg-surface-100 px-2.5 py-1 text-xs text-surface-700 dark:bg-surface-800 dark:text-surface-200"
                            >
                              {ing}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </Card>
                </li>
              ))}
            </ul>
          </>
        )}

        {/* History (collapsible) */}
        <Card className="p-3">
          <button
            onClick={() => setHistoryOpen(!historyOpen)}
            className="flex w-full items-center gap-2 text-start"
          >
            <History className="size-4 text-surface-500" />
            <h3 className="flex-1 font-semibold text-sm">{T.mealIdeas.history}</h3>
            <span className="text-[11px] text-surface-500 tabular">
              {historyQ.data?.items?.length ?? 0}
            </span>
            <ChevronDown
              className={cn(
                "size-4 text-surface-400 transition-transform",
                historyOpen && "rotate-180",
              )}
            />
          </button>

          {historyOpen ? (
            historyQ.isLoading ? (
              <div className="mt-2 h-12 animate-pulse rounded-xl bg-surface-100 dark:bg-surface-800" />
            ) : (historyQ.data?.items?.length ?? 0) === 0 ? (
              <p className="mt-3 text-xs text-surface-500">{T.mealIdeas.historyEmpty}</p>
            ) : (
              <>
                <ul className="mt-3 space-y-1.5">
                  {historyQ.data!.items.map((entry) => (
                    <li
                      key={entry.id}
                      className="flex items-center gap-2 rounded-lg border border-surface-200 px-2 py-1.5 dark:border-surface-800"
                    >
                      <button
                        onClick={() => loadHistory(entry)}
                        className="min-w-0 flex-1 text-start text-xs hover:text-brand-600"
                      >
                        <div className="font-medium truncate">
                          {entry.ideas.length} {T.mealIdeas.underLimit} {entry.max_calories}{" "}
                          {T.dash.kcal}
                        </div>
                        <div className="text-[10px] text-surface-500 tabular">
                          {fmtShortDay(entry.created_at.slice(0, 10))}
                        </div>
                      </button>
                      <button
                        onClick={() => deleteHistory.mutate(entry.id)}
                        className="rounded p-1 text-surface-400 hover:text-danger"
                        aria-label={T.mealIdeas.historyDelete}
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
                {(historyQ.data?.items?.length ?? 0) > 0 ? (
                  <button
                    onClick={() => {
                      if (confirm(T.mealIdeas.historyConfirmClear)) clearAllHistory.mutate();
                    }}
                    className="mt-3 text-[11px] text-danger hover:underline"
                  >
                    {T.mealIdeas.historyClearAll}
                  </button>
                ) : null}
              </>
            )
          ) : null}
        </Card>
      </div>
    </>
  );
}
