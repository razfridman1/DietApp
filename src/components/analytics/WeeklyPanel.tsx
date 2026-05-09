"use client";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { AlertTriangle, Dumbbell } from "lucide-react";
import { Card, CardHeader, CardTitle, CardSubtle } from "@/components/ui/Card";
import { Stat } from "@/components/ui/Stat";
import { BarSeries } from "@/components/charts/BarSeries";
import { LineSeries } from "@/components/charts/LineSeries";
import { api } from "@/lib/client-api";
import { fmtKcal, fmtNum, fmtShortDay } from "@/lib/format";
import { T } from "@/lib/constants";
import type { DailyLog, TodayPayload } from "@/types";

interface WeeklyResp {
  days: DailyLog[];
  summary: { avgCalIn: number; avgCalOut: number; avgProtein: number; avgNet: number };
  anomalies: string[];
}

export function WeeklyPanel() {
  const router = useRouter();

  const today = useQuery({
    queryKey: ["today"],
    queryFn: () => api.get<TodayPayload>("/api/daily/today"),
  });
  const weekly = useQuery({
    queryKey: ["weekly", 7],
    queryFn: () => api.get<WeeklyResp>("/api/analytics/weekly?days=7"),
  });

  const tdee = today.data?.tdee ?? 0;
  const proteinTarget = today.data?.proteinTarget ?? 0;

  const days = weekly.data?.days ?? [];
  const calories = days.map((d) => ({
    date: d.log_date,
    value: Number(d.calories_in),
    hasActivity: Number(d.calories_out) > 0,
  }));
  const protein = days.map((d) => ({
    date: d.log_date,
    value: Number(d.protein_total),
    hasActivity: Number(d.calories_out) > 0,
  }));
  const net = days.map((d) => ({
    date: d.log_date,
    value: Number(d.net_calories),
  }));

  const openDay = (date?: string) => {
    if (!date) return;
    router.push(`/day/${date}`);
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-surface-500">{T.analytics.days7}</p>

      <Card>
        <CardHeader>
          <CardTitle>{T.analytics.avgCalories}</CardTitle>
          <CardSubtle>{fmtKcal(weekly.data?.summary.avgCalIn ?? 0)}</CardSubtle>
        </CardHeader>
        <BarSeries
          data={calories}
          reference={tdee}
          unit={T.dash.kcal}
          colorVar="#0ea5e9"
          onBarClick={openDay}
        />
        <p className="mt-2 flex items-center gap-1.5 text-[11px] text-surface-500 dark:text-surface-300">
          <span className="inline-block size-2 rounded-full bg-success" />
          <Dumbbell className="size-3" />
          {T.dayDetail.hadActivity}
        </p>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{T.analytics.avgProtein}</CardTitle>
          <CardSubtle>{fmtNum(weekly.data?.summary.avgProtein ?? 0)} ג׳</CardSubtle>
        </CardHeader>
        <BarSeries
          data={protein}
          reference={proteinTarget}
          unit="ג׳"
          colorVar="#10b981"
          onBarClick={openDay}
        />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{T.analytics.avgNet}</CardTitle>
          <CardSubtle>{fmtKcal(weekly.data?.summary.avgNet ?? 0)}</CardSubtle>
        </CardHeader>
        <LineSeries data={net} reference={tdee} unit={T.dash.kcal} colorVar="#f59e0b" />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{T.analytics.anomalies}</CardTitle>
        </CardHeader>
        {(weekly.data?.anomalies ?? []).length === 0 ? (
          <p className="text-sm text-surface-500">{T.analytics.noAnomalies}</p>
        ) : (
          <ul className="space-y-2">
            {weekly.data!.anomalies.map((d) => (
              <li
                key={d}
                onClick={() => openDay(d)}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-warn/30 bg-warn/5 p-3 text-sm hover:bg-warn/10"
              >
                <AlertTriangle className="size-4 text-warn shrink-0" />
                <span>{fmtShortDay(d)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="grid grid-cols-3 gap-2">
        <Card>
          <Stat label={T.dash.caloriesIn} value={fmtNum(weekly.data?.summary.avgCalIn ?? 0)} hint="ממוצע" />
        </Card>
        <Card>
          <Stat label={T.dash.caloriesOut} value={fmtNum(weekly.data?.summary.avgCalOut ?? 0)} hint="ממוצע" />
        </Card>
        <Card>
          <Stat label={T.dash.protein} value={fmtNum(weekly.data?.summary.avgProtein ?? 0)} hint="ממוצע ג׳" />
        </Card>
      </div>
    </div>
  );
}
