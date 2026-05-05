"use client";
import { Trash2, Sparkles, Pencil } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { fmtNum, fmtTime } from "@/lib/format";
import { T } from "@/lib/constants";
import type { Meal } from "@/types";

export function MealsList({
  meals,
  onDelete,
  onEdit,
}: {
  meals: Meal[];
  onDelete: (id: string) => void;
  onEdit: (meal: Meal) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{T.dash.mealsLog}</CardTitle>
        <span className="text-xs text-surface-500">{meals.length}</span>
      </CardHeader>
      {meals.length === 0 ? (
        <p className="text-sm text-surface-500 dark:text-surface-300">{T.dash.noMeals}</p>
      ) : (
        <ul className="divide-y divide-surface-200 dark:divide-surface-800">
          {meals.map((m) => (
            <li key={m.id} className="flex items-start justify-between gap-3 py-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate font-medium">{m.name}</span>
                  {m.ai_generated ? (
                    <Sparkles className="size-3.5 text-brand-500 shrink-0" />
                  ) : null}
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-surface-500 dark:text-surface-300 tabular">
                  <span>{fmtTime(m.meal_time)}</span>
                  {m.grams ? <span>· {fmtNum(m.grams)} ג׳</span> : null}
                  <span>· {fmtNum(m.calories)} קק״ל</span>
                  <span>· חלבון {fmtNum(m.protein)} ג׳</span>
                  <span>· פחמ׳ {fmtNum(m.carbs)} ג׳</span>
                  <span>· שומן {fmtNum(m.fats)} ג׳</span>
                </div>
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  onClick={() => onEdit(m)}
                  className="rounded-lg p-2 text-surface-500 hover:bg-surface-100 hover:text-brand-600 dark:hover:bg-surface-800 dark:hover:text-brand-300"
                  aria-label={T.dash.edit}
                >
                  <Pencil className="size-4" />
                </button>
                <button
                  onClick={() => onDelete(m.id)}
                  className="rounded-lg p-2 text-surface-500 hover:bg-surface-100 hover:text-danger dark:hover:bg-surface-800"
                  aria-label={T.dash.delete}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
