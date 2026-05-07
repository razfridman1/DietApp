"use client";
import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Apple,
  Dumbbell,
  Sparkles,
  Eye,
  EyeOff,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardSubtle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { fmtDate, fmtNum, fmtTime } from "@/lib/format";
import { T } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Activity, Meal, DailyLog, ActivityType } from "@/types";

const ACTIVITY_LABELS: Record<ActivityType, string> = {
  walk: "הליכה",
  run: "ריצה",
  gym: "אימון כוח",
  swim: "שחייה",
  cycle: "אופניים",
  yoga: "יוגה",
  other: "פעילות",
};

export interface DailyHistoryItem {
  date: string;
  log: DailyLog;
  meals: Meal[];
  activities: Activity[];
  workoutCount: number;
  workoutMinutes: number;
}

function isEmptyDay(d: DailyHistoryItem): boolean {
  return (
    d.meals.length === 0 &&
    d.activities.length === 0 &&
    Number(d.log.calories_in) === 0 &&
    Number(d.log.calories_out) === 0
  );
}

function DayCard({
  day,
  defaultOpen,
}: {
  day: DailyHistoryItem;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState<boolean>(defaultOpen);
  const empty = isEmptyDay(day);

  const totalKcal = Number(day.log.calories_in || 0);
  const totalProtein = Number(day.log.protein_total || 0);

  return (
    <div
      className={cn(
        "rounded-2xl border overflow-hidden transition-colors",
        empty
          ? "border-surface-200 bg-surface-50/50 dark:border-surface-800 dark:bg-surface-900/40"
          : "border-surface-200 bg-white dark:border-surface-800 dark:bg-surface-900",
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-right hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2 text-surface-400">
          {open ? (
            <ChevronUp className="size-4" />
          ) : (
            <ChevronDown className="size-4" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs text-surface-500 dark:text-surface-300 tabular shrink-0">
              {empty ? (
                <span className="italic">{T.reports.historyDayEmpty}</span>
              ) : (
                <>
                  <span>{fmtNum(totalKcal)} {T.reports.kcal}</span>
                  <span className="mx-1.5 text-surface-300">·</span>
                  <span>
                    {fmtNum(totalProtein)} {T.reports.grams}
                  </span>
                  {day.workoutCount > 0 ? (
                    <>
                      <span className="mx-1.5 text-surface-300">·</span>
                      <span>
                        {day.workoutCount} {T.reports.workoutCountUnit}
                      </span>
                    </>
                  ) : null}
                </>
              )}
            </div>
            <div className="font-semibold truncate">
              {fmtDate(day.date, "EEEE, d/M/yyyy")}
            </div>
          </div>
        </div>
      </button>

      {open ? (
        <div className="border-t border-surface-200 dark:border-surface-800 px-4 py-3 space-y-3">
          {empty ? (
            <p className="text-sm text-surface-500 dark:text-surface-300 italic">
              {T.reports.historyDayEmpty}
            </p>
          ) : (
            <>
              {/* Meals */}
              <div>
                <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-surface-500 dark:text-surface-300">
                  <Apple className="size-3.5 text-brand-500" />
                  <span>
                    {T.reports.foodsLabel} ({day.meals.length})
                  </span>
                </div>
                {day.meals.length === 0 ? (
                  <p className="text-xs text-surface-400 italic">
                    {T.dash.noMeals}
                  </p>
                ) : (
                  <ul className="divide-y divide-surface-100 dark:divide-surface-800">
                    {day.meals.map((m) => (
                      <li
                        key={m.id}
                        className="py-2 flex items-start justify-between gap-3"
                      >
                        <div className="text-xs text-surface-500 dark:text-surface-300 tabular shrink-0 text-left whitespace-nowrap">
                          {fmtNum(Number(m.calories))} {T.reports.kcal}
                          <br />
                          <span>
                            {fmtNum(Number(m.protein))} {T.reports.grams}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium truncate">
                              {m.name}
                            </span>
                            {m.ai_generated ? (
                              <Sparkles className="size-3 text-brand-500 shrink-0" />
                            ) : null}
                          </div>
                          <div className="text-[11px] text-surface-500 dark:text-surface-400 tabular">
                            {fmtTime(m.meal_time)}
                            {m.grams ? (
                              <>
                                <span className="mx-1">·</span>
                                {fmtNum(m.grams)} {T.reports.grams}
                              </>
                            ) : null}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Activities */}
              <div>
                <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-surface-500 dark:text-surface-300">
                  <Dumbbell className="size-3.5 text-warn" />
                  <span>
                    {T.reports.workoutsLabel} ({day.activities.length})
                  </span>
                </div>
                {day.activities.length === 0 ? (
                  <p className="text-xs text-surface-400 italic">
                    {T.dash.noActivities}
                  </p>
                ) : (
                  <ul className="divide-y divide-surface-100 dark:divide-surface-800">
                    {day.activities.map((a) => (
                      <li
                        key={a.id}
                        className="py-2 flex items-start justify-between gap-3"
                      >
                        <div className="text-xs text-surface-500 dark:text-surface-300 tabular shrink-0 text-left whitespace-nowrap">
                          {fmtNum(Number(a.duration_min))}{" "}
                          {T.reports.minutesShort}
                          <br />
                          <span>
                            {fmtNum(Number(a.calories_burned))} {T.reports.kcal}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium truncate">
                              {a.description || ACTIVITY_LABELS[a.type]}
                            </span>
                            {a.ai_generated ? (
                              <Sparkles className="size-3 text-brand-500 shrink-0" />
                            ) : null}
                          </div>
                          <div className="text-[11px] text-surface-500 dark:text-surface-400 tabular">
                            {ACTIVITY_LABELS[a.type]}
                            <span className="mx-1">·</span>
                            {T.reports.intensityLabel}{" "}
                            {T.intensity[a.intensity]}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Daily totals */}
              <div className="rounded-lg bg-surface-50 dark:bg-surface-800/50 px-3 py-2 flex items-center justify-between gap-2 text-xs">
                <div className="text-surface-500 dark:text-surface-300 tabular text-left">
                  {fmtNum(totalKcal)} {T.reports.kcal}
                  <span className="mx-1.5">·</span>
                  {fmtNum(totalProtein)} {T.reports.grams}
                  <span className="mx-1.5">·</span>
                  {day.workoutCount} {T.reports.workoutCountUnit}
                  {day.workoutMinutes > 0 ? (
                    <>
                      {" ("}
                      {fmtNum(day.workoutMinutes)} {T.reports.minutesShort}
                      {")"}
                    </>
                  ) : null}
                </div>
                <div className="font-semibold">{T.reports.dailyTotalLabel}</div>
              </div>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}

export function DailyHistory({ days }: { days: DailyHistoryItem[] }) {
  const [showEmpty, setShowEmpty] = useState(false);
  const [collapseAll, setCollapseAll] = useState(false);
  // collapseAll is just used as a key prefix to remount DayCard nodes when
  // the user toggles "expand/collapse all", giving the cards a fresh
  // defaultOpen state.

  // Newest day first.
  const sorted = useMemo(
    () => [...days].sort((a, b) => (a.date < b.date ? 1 : -1)),
    [days],
  );

  const visible = useMemo(
    () => (showEmpty ? sorted : sorted.filter((d) => !isEmptyDay(d))),
    [sorted, showEmpty],
  );

  const trackedCount = sorted.filter((d) => !isEmptyDay(d)).length;
  // Default-open cards: only the first 3 newest (with data). For yearly
  // ranges this avoids paint-jank from 365 expanded sections at once.
  const defaultOpenCutoff = 3;

  if (sorted.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{T.reports.historyTitle}</CardTitle>
        </CardHeader>
        <p className="text-sm text-surface-500 dark:text-surface-300">
          {T.reports.historyEmpty}
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{T.reports.historyTitle}</CardTitle>
        <CardSubtle>
          {trackedCount}/{sorted.length} {T.reports.daysUnit}
        </CardSubtle>
      </CardHeader>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setCollapseAll((v) => !v)}
        >
          {collapseAll ? (
            <>
              <ChevronDown className="size-4" />
              {T.reports.historyExpand}
            </>
          ) : (
            <>
              <ChevronUp className="size-4" />
              {T.reports.historyCollapse}
            </>
          )}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowEmpty((v) => !v)}
        >
          {showEmpty ? (
            <>
              <EyeOff className="size-4" />
              {T.reports.historyHideEmpty}
            </>
          ) : (
            <>
              <Eye className="size-4" />
              {T.reports.historyShowEmpty}
            </>
          )}
        </Button>
      </div>

      {visible.length === 0 ? (
        <p className="text-sm text-surface-500 dark:text-surface-300">
          {T.reports.historyEmpty}
        </p>
      ) : (
        <div className="space-y-2">
          {visible.map((d, idx) => (
            <DayCard
              key={(collapseAll ? "c-" : "e-") + d.date}
              day={d}
              defaultOpen={!collapseAll && idx < defaultOpenCutoff}
            />
          ))}
        </div>
      )}
    </Card>
  );
}
