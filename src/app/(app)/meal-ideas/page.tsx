"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ChefHat, Sparkles, Flame, RefreshCw } from "lucide-react";
import { TopBar } from "@/components/nav/TopBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { api } from "@/lib/client-api";
import { T } from "@/lib/constants";
import type { MealIdea } from "@/lib/ai/mealIdeas";

export default function MealIdeasPage() {
  const [limitInput, setLimitInput] = useState<string>("");
  const [submittedLimit, setSubmittedLimit] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const generate = useMutation({
    mutationFn: (maxCalories: number) =>
      api.post<{ ideas: MealIdea[] }>("/api/ai/meal-ideas", { maxCalories }),
  });

  const ideas = generate.data?.ideas ?? [];

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
            {formError ? (
              <p className="text-sm text-danger">{formError}</p>
            ) : null}
            <Button
              type="submit"
              loading={generate.isPending}
              className="w-full"
            >
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
        ) : ideas.length === 0 ? (
          !generate.isError ? (
            <Card className="text-sm text-surface-500 dark:text-surface-300">
              {T.mealIdeas.empty}
            </Card>
          ) : null
        ) : (
          <>
            <div className="flex items-center justify-between px-1">
              <p className="text-sm text-surface-500 dark:text-surface-300">
                {ideas.length} {T.mealIdeas.underLimit}
                {submittedLimit ? ` ${submittedLimit} ${T.dash.kcal}` : ""}
              </p>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => submittedLimit && generate.mutate(submittedLimit)}
                loading={generate.isPending}
              >
                <RefreshCw className="size-4" />
                {T.mealIdeas.regenerate}
              </Button>
            </div>
            <ul className="space-y-3">
              {ideas.map((idea, i) => (
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
      </div>
    </>
  );
}
