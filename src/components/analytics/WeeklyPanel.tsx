"use client";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { AlertTriangle, CalendarRange, Dumbbell } from "lucide-react";
import { Card, CardHeader, CardTitle, CardSubtle } from "@/components/ui/Card";
import { Stat } from "@/components/ui/Stat";
import { Input, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { BarSeries } from "@/components/charts/BarSeries";
import { LineSeries } from "@/components/charts/LineSeries";
import { api } from "@/lib/client-api";
import { fmtKcal, fmtNum, fmtShortDay, isoDate, todayISO } from "@/lib/format";
import { T } from "@/lib/constants";
import type { DailyLog, TodayPayload } from "@/types";

interface WeeklyResp {
  days: DailyLog[];
  summary: { avgCalIn: number; avgCalOut: number; avgProtein: number; avgNet: number };
  anomalies: string[];
}

export function WeeklyPanel() {
  const router = useRouter();

  // Default range: last 7 days, inclusive of today.
  const defaultRange = useMemo(() => {
    const end = todayISO();
    const startD = new Date();
    startD.setDate(startD.getDate() - 6);
    return { start: isoDate(startD), end };
  }, []);
  const [rangeStart, setRangeStart] = useState(defaultRange.start);
  const [rangeEnd, setRangeEnd] = useState(defaultRange.end);
  // The actual values used for the query — only updated on submit.
  const [appliedRange, setAppliedRange] = useState<{ start: string; end: string } | null>(null);

  const rangeValid = !!rangeStart && !!rangeEnd && rangeStart <= rangeEnd;

  const today = useQuery({
    queryKey: ["today"],
    queryFn: () => api.get<TodayPayload>("/api/daily/today"),
  });
  const weekly = useQuery({
    queryKey: ["weekly", 7],
    queryFn: () => api.get<WeeklyResp>("/api/analytics/weekly?days=7"),
  });
  const range = useQuery({
    enabled: !!appliedRange,
    queryKey: ["weekly-range", appliedRange?.start, appliedRange?.end],
    queryFn: () =>
      api.get<WeeklyResp>(
        `/api/analytics/weekly?start=${appliedRange!.start}&end=${appliedRange!.end}`,
      ),
  });

  // How many days were tracked (have any food/activity logged) in the chosen range.
  const trackedDays = (range.data?.days ?? []).filter(
    (d) => Number(d.calories_in) || Number(d.calories_out),
  ).length;
  const totalDaysInRange = range.data?.days.length ?? 0;

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
      <Card>
        <div className="mb-3">
          <h3 className="flex items-center gap-2 text-base font-semibold">
            <CalendarRange className="size-4 text-brand-600" />
            {T.analytics.rangeTitle}
          </h3>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-300">
            {T.analytics.rangeSubtitle}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="range-start">{T.analytics.rangeFrom}</Label>
            <Input
              id="range-start"
              type="date"
              value={rangeStart}
              max={rangeEnd || undefined}
              onChange={(e) => setRangeStart(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="range-end">{T.analytics.rangeTo}</Label>
            <Input
              id="range-end"
              type="date"
              value={rangeEnd}
              min={rangeStart || undefined}
              max={todayISO()}
              onChange={(e) => setRangeEnd(e.target.value)}
            />
          </div>
        </div>
        {!rangeValid && rangeStart && rangeEnd ? (
          <p className="mt-2 text-xs text-danger">{T.analytics.rangeInvalid}</p>
        ) : null}
        <Button
          className="mt-3 w-full"
          disabled={!rangeValid}
          loading={range.isFetching && !!appliedRange}
          onClick={() =>
            rangeValid && setAppliedRange({ start: rangeStart, end: rangeEnd })
          }
        >
          {range.isFetching && !!appliedRange
            ? T.analytics.rangeComputing
            : T.analytics.rangeCompute}
        </Button>

        {appliedRange && range.data ? (
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-surface-500 dark:text-surface-300">
              <span>
                {fmtShortDay(appliedRange.start)} — {fmtShortDay(appliedRange.end)}
              </span>
              <span>
                {fmtNum(trackedDays)}/{fmtNum(totalDaysInRange)} {T.analytics.rangeDaysCount}
              </span>
            </div>
            {trackedDays === 0 ? (
              <p className="text-sm text-surface-500">{T.analytics.rangeNoData}</p>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-2">
                  <Card>
                    <Stat
                      label={T.dash.caloriesIn}
                      value={fmtNum(range.data.summary.avgCalIn)}
                      hint="ממוצע"
                    />
                  </Card>
                  <Card>
                    <Stat
                      label={T.dash.caloriesOut}
                      value={fmtNum(range.data.summary.avgCalOut)}
                      hint="ממוצע"
                    />
                  </Card>
                  <Card>
                    <Stat
                      label={T.dash.protein}
                      value={fmtNum(range.data.summary.avgProtein)}
                      hint="ממוצע ג׳"
                    />
                  </Card>
                </div>
                <Card>
                  <Stat
                    label={T.analytics.avgNet}
                    value={fmtKcal(range.data.summary.avgNet)}
                    hint="ממוצע מאזן"
                    tone={range.data.summary.avgNet > 0 ? "warn" : "success"}
                  />
                </Card>
              </>
            )}
          </div>
        ) : null}
      </Card>

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
