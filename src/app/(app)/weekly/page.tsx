"use client";
import { useQuery } from "@tanstack/react-query";
import { TopBar } from "@/components/nav/TopBar";
import { Card, CardHeader, CardTitle, CardSubtle } from "@/components/ui/Card";
import { Stat } from "@/components/ui/Stat";
import { BarSeries } from "@/components/charts/BarSeries";
import { LineSeries } from "@/components/charts/LineSeries";
import { api } from "@/lib/client-api";
import { fmtKcal, fmtNum, fmtShortDay } from "@/lib/format";
import { T } from "@/lib/constants";
import type { DailyLog, TodayPayload } from "@/types";
import { AlertTriangle } from "lucide-react";

interface WeeklyResp {
  days: DailyLog[];
  summary: { avgCalIn: number; avgCalOut: number; avgProtein: number; avgNet: number };
  anomalies: string[];
}

export default function WeeklyPage() {
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

  const calories = (weekly.data?.days ?? []).map((d) => ({
    date: d.log_date,
    value: Number(d.calories_in),
  }));
  const protein = (weekly.data?.days ?? []).map((d) => ({
    date: d.log_date,
    value: Number(d.protein_total),
  }));
  const net = (weekly.data?.days ?? []).map((d) => ({
    date: d.log_date,
    value: Number(d.net_calories),
  }));

  return (
    <>
      <TopBar title={T.analytics.weeklyTitle} />
      <div className="space-y-4 pt-4">
        <p className="text-xs text-surface-500">{T.analytics.days7}</p>

        <Card>
          <CardHeader>
            <CardTitle>{T.analytics.avgCalories}</CardTitle>
            <CardSubtle>{fmtKcal(weekly.data?.summary.avgCalIn ?? 0)}</CardSubtle>
          </CardHeader>
          <BarSeries data={calories} reference={tdee} unit={T.dash.kcal} colorVar="#0ea5e9" />
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{T.analytics.avgProtein}</CardTitle>
            <CardSubtle>{fmtNum(weekly.data?.summary.avgProtein ?? 0)} ג׳</CardSubtle>
          </CardHeader>
          <BarSeries data={protein} reference={proteinTarget} unit="ג׳" colorVar="#10b981" />
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
                  className="flex items-center gap-2 rounded-lg border border-warn/30 bg-warn/5 p-3 text-sm"
                >
                  <AlertTriangle className="size-4 text-warn shrink-0" />
                  <span>{fmtShortDay(d)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="grid grid-cols-3 gap-2">
          <Card><Stat label={T.dash.caloriesIn} value={fmtNum(weekly.data?.summary.avgCalIn ?? 0)} hint="ממוצע" /></Card>
          <Card><Stat label={T.dash.caloriesOut} value={fmtNum(weekly.data?.summary.avgCalOut ?? 0)} hint="ממוצע" /></Card>
          <Card><Stat label={T.dash.protein} value={fmtNum(weekly.data?.summary.avgProtein ?? 0)} hint="ממוצע ג׳" /></Card>
        </div>
      </div>
    </>
  );
}
