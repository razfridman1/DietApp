"use client";
import { useQuery } from "@tanstack/react-query";
import { TopBar } from "@/components/nav/TopBar";
import { Card, CardHeader, CardTitle, CardSubtle } from "@/components/ui/Card";
import { Stat } from "@/components/ui/Stat";
import { Progress } from "@/components/ui/Progress";
import { BarSeries } from "@/components/charts/BarSeries";
import { LineSeries } from "@/components/charts/LineSeries";
import { api } from "@/lib/client-api";
import { fmtKcal, fmtKg, fmtNum } from "@/lib/format";
import { T } from "@/lib/constants";
import type { DailyLog, TodayPayload, WeightEntry } from "@/types";

interface MonthlyResp {
  days: DailyLog[];
  weights: WeightEntry[];
  summary: { avgCalIn: number; avgCalOut: number; avgProtein: number; avgNet: number };
  consistency: number;
}

export default function MonthlyPage() {
  const today = useQuery({
    queryKey: ["today"],
    queryFn: () => api.get<TodayPayload>("/api/daily/today"),
  });
  const monthly = useQuery({
    queryKey: ["monthly", 30],
    queryFn: () => api.get<MonthlyResp>("/api/analytics/monthly?days=30"),
  });

  const tdee = today.data?.tdee ?? 0;
  const calories = (monthly.data?.days ?? []).map((d) => ({
    date: d.log_date,
    value: Number(d.calories_in),
  }));
  const protein = (monthly.data?.days ?? []).map((d) => ({
    date: d.log_date,
    value: Number(d.protein_total),
  }));
  const weights = (monthly.data?.weights ?? []).map((w) => ({
    date: w.log_date,
    value: Number(w.weight_kg),
  }));

  const consistencyPct = Math.round((monthly.data?.consistency ?? 0) * 100);

  return (
    <>
      <TopBar title={T.analytics.monthlyTitle} />
      <div className="space-y-4 pt-4">
        <p className="text-xs text-surface-500">{T.analytics.days30}</p>

        <Card>
          <CardHeader>
            <CardTitle>{T.analytics.weightTrend}</CardTitle>
            <CardSubtle>
              {weights.length > 0
                ? `${fmtKg(weights[0].value)} → ${fmtKg(weights[weights.length - 1].value)}`
                : "אין נתוני משקל"}
            </CardSubtle>
          </CardHeader>
          {weights.length > 1 ? (
            <LineSeries data={weights} unit="ק״ג" colorVar="#0ea5e9" />
          ) : (
            <p className="text-sm text-surface-500">
              הוסף/י מדידות משקל בלשונית הפרופיל כדי לראות מגמה.
            </p>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{T.analytics.avgCalories}</CardTitle>
            <CardSubtle>{fmtKcal(monthly.data?.summary.avgCalIn ?? 0)}</CardSubtle>
          </CardHeader>
          <BarSeries data={calories} reference={tdee} unit={T.dash.kcal} colorVar="#0ea5e9" />
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{T.analytics.avgProtein}</CardTitle>
            <CardSubtle>{fmtNum(monthly.data?.summary.avgProtein ?? 0)} ג׳</CardSubtle>
          </CardHeader>
          <BarSeries data={protein} unit="ג׳" colorVar="#10b981" />
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{T.analytics.consistency}</CardTitle>
            <CardSubtle>{consistencyPct}% מהימים מתועדים</CardSubtle>
          </CardHeader>
          <Progress
            value={consistencyPct}
            max={100}
            tone={consistencyPct >= 70 ? "success" : consistencyPct >= 40 ? "warn" : "danger"}
          />
        </Card>

        <div className="grid grid-cols-2 gap-2">
          <Card>
            <Stat
              label={T.analytics.avgNet}
              value={fmtNum(monthly.data?.summary.avgNet ?? 0)}
              hint={T.dash.kcal}
            />
          </Card>
          <Card>
            <Stat
              label={T.analytics.avgCalories}
              value={fmtNum(monthly.data?.summary.avgCalIn ?? 0)}
              hint={T.dash.kcal}
            />
          </Card>
        </div>
      </div>
    </>
  );
}
