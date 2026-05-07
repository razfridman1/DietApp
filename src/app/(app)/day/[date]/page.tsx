"use client";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowRight,
  Sparkles,
  Footprints,
  Dumbbell as Dumb,
  Bike,
  Waves,
  PersonStanding,
  Activity as ActivityIcon,
  Dumbbell,
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Stat } from "@/components/ui/Stat";
import { ThemeToggle } from "@/components/ThemeToggle";
import { api } from "@/lib/client-api";
import { fmtDate, fmtNum, fmtTime } from "@/lib/format";
import { T } from "@/lib/constants";
import type { Activity, ActivityType, DailyLog, Meal } from "@/types";

interface DayPayload {
  date: string;
  log: DailyLog;
  meals: Meal[];
  activities: Activity[];
}

const ACTIVITY_ICONS: Record<ActivityType, any> = {
  walk: Footprints,
  run: ActivityIcon,
  gym: Dumb,
  swim: Waves,
  cycle: Bike,
  yoga: PersonStanding,
  other: ActivityIcon,
};

export default function DayDetailPage() {
  const params = useParams<{ date: string }>();
  const router = useRouter();
  const date = params?.date ?? "";

  const q = useQuery({
    queryKey: ["day-detail", date],
    queryFn: () => api.get<DayPayload>(`/api/daily/by-date?date=${encodeURIComponent(date)}`),
    enabled: /^\d{4}-\d{2}-\d{2}$/.test(date),
  });

  const meals = q.data?.meals ?? [];
  const activities = q.data?.activities ?? [];
  const log = q.data?.log;
  const hadActivity = activities.length > 0 || Number(log?.calories_out ?? 0) > 0;
  const isEmpty = !q.isLoading && meals.length === 0 && activities.length === 0;

  return (
    <>
      <header
        dir="rtl"
        className="sticky top-0 z-30 border-b border-surface-200 bg-white/80 backdrop-blur dark:bg-surface-900/80 dark:border-surface-800"
      >
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => router.back()}
              aria-label={T.dayDetail.back}
              className="rounded-full p-2 hover:bg-surface-100 dark:hover:bg-surface-800"
            >
              <ArrowRight className="size-5" />
            </button>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold leading-tight">
                {fmtDate(date)}
              </h1>
              <p className="text-xs text-surface-500 dark:text-surface-300">
                {T.dayDetail.title}
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <div className="space-y-4 pt-4">
        {/* Activity indicator banner */}
        <Card
          className={
            hadActivity
              ? "border-success/40 bg-success/5"
              : "border-surface-200 bg-surface-50 dark:bg-surface-900"
          }
        >
          <div className="flex items-center gap-3">
            <div
              className={
                hadActivity
                  ? "rounded-full bg-success/15 p-2 text-success"
                  : "rounded-full bg-surface-200 p-2 text-surface-500 dark:bg-surface-800"
              }
            >
              <Dumbbell className="size-5" />
            </div>
            <div className="text-sm font-medium">
              {hadActivity ? T.dayDetail.hadActivity : T.dayDetail.noActivity}
            </div>
          </div>
        </Card>

        {/* Daily summary */}
        <Card>
          <CardHeader>
            <CardTitle>{T.dayDetail.summary}</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-2 gap-3">
            <Stat
              label={T.dash.caloriesIn}
              value={fmtNum(Number(log?.calories_in ?? 0))}
              hint={T.dash.kcal}
            />
            <Stat
              label={T.dash.caloriesOut}
              value={fmtNum(Number(log?.calories_out ?? 0))}
              hint={T.dash.kcal}
            />
            <Stat
              label={T.dash.netCalories}
              value={fmtNum(Number(log?.net_calories ?? 0))}
              hint={T.dash.kcal}
            />
            <Stat
              label={T.dash.protein}
              value={fmtNum(Number(log?.protein_total ?? 0))}
              hint={T.dash.grams}
            />
          </div>
        </Card>

        {q.isLoading ? (
          <Card className="h-40 animate-pulse" />
        ) : q.error ? (
          <Card className="text-sm text-danger">
            {(q.error as Error).message}
          </Card>
        ) : isEmpty ? (
          <Card className="text-sm text-surface-500 dark:text-surface-300">
            {T.dayDetail.noData}
          </Card>
        ) : (
          <>
            {/* Meals */}
            <Card>
              <CardHeader>
                <CardTitle>{T.dash.mealsLog}</CardTitle>
                <span className="text-xs text-surface-500">{meals.length}</span>
              </CardHeader>
              {meals.length === 0 ? (
                <p className="text-sm text-surface-500 dark:text-surface-300">
                  {T.dash.noMeals}
                </p>
              ) : (
                <ul className="divide-y divide-surface-200 dark:divide-surface-800">
                  {meals.map((m) => (
                    <li key={m.id} className="py-3">
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
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            {/* Activities */}
            <Card>
              <CardHeader>
                <CardTitle>{T.dash.activitiesLog}</CardTitle>
                <span className="text-xs text-surface-500">{activities.length}</span>
              </CardHeader>
              {activities.length === 0 ? (
                <p className="text-sm text-surface-500 dark:text-surface-300">
                  {T.dash.noActivities}
                </p>
              ) : (
                <ul className="divide-y divide-surface-200 dark:divide-surface-800">
                  {activities.map((a) => {
                    const Icon = ACTIVITY_ICONS[a.type] ?? ActivityIcon;
                    return (
                      <li key={a.id} className="flex items-start gap-3 py-3">
                        <div className="mt-0.5 rounded-lg bg-brand-50 p-2 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
                          <Icon className="size-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate font-medium">
                              {a.description || T.activityType[a.type]}
                            </span>
                            {a.ai_generated ? (
                              <Sparkles className="size-3.5 text-brand-500" />
                            ) : null}
                          </div>
                          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-surface-500 dark:text-surface-300 tabular">
                            <span>{fmtTime(a.performed_at)}</span>
                            <span>· {fmtNum(a.duration_min)} דק׳</span>
                            <span>· עצימות {T.intensity[a.intensity]}</span>
                            <span>· {fmtNum(a.calories_burned)} קק״ל</span>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>
          </>
        )}
      </div>
    </>
  );
}
