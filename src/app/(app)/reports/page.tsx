"use client";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  FileText,
  Download,
  Mail,
  CalendarRange,
  Sparkles,
  Activity as ActivityIcon,
  Apple,
  Dumbbell,
  TrendingUp,
} from "lucide-react";
import { TopBar } from "@/components/nav/TopBar";
import { Card, CardHeader, CardTitle, CardSubtle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Stat } from "@/components/ui/Stat";
import { Input, Label } from "@/components/ui/Input";
import { Toast, type ToastTone } from "@/components/ui/Toast";
import { BarSeries } from "@/components/charts/BarSeries";
import { LineSeries } from "@/components/charts/LineSeries";
import {
  DailyHistory,
  type DailyHistoryItem,
} from "@/components/reports/DailyHistory";
import { api } from "@/lib/client-api";
import { fmtNum, todayISO } from "@/lib/format";
import { T } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { ReportRange } from "@/lib/reports/types";

interface PreviewResp {
  range: ReportRange;
  from: string;
  to: string;
  summary: {
    trackedDays: number;
    totalDays: number;
    avgCalories: number;
    avgProtein: number;
    totalCalories: number;
    totalProtein: number;
    totalWorkouts: number;
    totalWorkoutMinutes: number;
  };
  charts: {
    calories: { date: string; value: number }[];
    protein: { date: string; value: number }[];
    workouts: { date: string; value: number }[];
    net: { date: string; value: number }[];
  };
  days: DailyHistoryItem[];
}

interface ExportResp {
  ok: boolean;
  sentTo: string;
  filename: string;
  range: ReportRange;
  from: string;
  to: string;
}

const RANGE_OPTIONS: {
  key: ReportRange;
  label: string;
  hint: string;
}[] = [
  { key: "weekly",  label: T.reports.rangeWeekly,  hint: T.reports.rangeWeeklyHint },
  { key: "monthly", label: T.reports.rangeMonthly, hint: T.reports.rangeMonthlyHint },
  { key: "yearly",  label: T.reports.rangeYearly,  hint: T.reports.rangeYearlyHint },
  { key: "custom",  label: T.reports.rangeCustom,  hint: T.reports.rangeCustomHint },
];

function defaultCustomFrom(): string {
  const d = new Date();
  d.setDate(d.getDate() - 13);
  const tz = d.getTimezoneOffset() * 60_000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
}

export default function ReportsPage() {
  const [range, setRange] = useState<ReportRange>("weekly");
  const [from, setFrom] = useState<string>(defaultCustomFrom());
  const [to, setTo] = useState<string>(todayISO());
  const [toast, setToast] = useState<{ msg: string; tone: ToastTone } | null>(
    null,
  );

  const customValid: boolean =
    range !== "custom" || Boolean(from && to && from <= to);

  const preview = useQuery<PreviewResp>({
    queryKey: ["report-preview", range, from, to],
    enabled: customValid,
    queryFn: () => {
      const qs = new URLSearchParams({ range });
      if (range === "custom") {
        qs.set("from", from);
        qs.set("to", to);
      }
      return api.get<PreviewResp>("/api/reports/preview?" + qs.toString());
    },
  });

  const exportMutation = useMutation({
    mutationFn: () =>
      api.post<ExportResp>("/api/reports/export", {
        range,
        ...(range === "custom" ? { from, to } : {}),
      }),
    onSuccess: () => setToast({ msg: T.reports.successMsg, tone: "success" }),
    onError: (e: any) =>
      setToast({
        msg: e?.message
          ? T.reports.errorMsg + ": " + e.message
          : T.reports.errorMsg,
        tone: "error",
      }),
  });

  const summary = preview.data?.summary;
  const charts = preview.data?.charts;
  const isExporting = exportMutation.isPending;

  type Pt = { date: string; value: number };
  const caloriesArr: Pt[] = charts?.calories ?? [];
  const proteinArr: Pt[] = charts?.protein ?? [];
  const workoutArr: Pt[] = charts?.workouts ?? [];
  const netArr: Pt[] = charts?.net ?? [];

  const caloriesPoints = caloriesArr.map((p, i) => ({
    date: p.date,
    value: p.value,
    hasActivity: (workoutArr[i]?.value ?? 0) > 0,
  }));
  const proteinPoints = proteinArr.map((p, i) => ({
    date: p.date,
    value: p.value,
    hasActivity: (workoutArr[i]?.value ?? 0) > 0,
  }));
  const workoutPoints = workoutArr.map((p) => ({ date: p.date, value: p.value }));
  const netPoints = netArr.map((p) => ({ date: p.date, value: p.value }));

  const noData =
    !preview.isLoading && !!summary && summary.trackedDays === 0;

  return (
    <>
      <TopBar title={T.reports.title} />
      {toast ? (
        <Toast
          message={toast.msg}
          tone={toast.tone}
          onClose={() => setToast(null)}
        />
      ) : null}

      <div className="space-y-4 pt-4">
        {/* Hero */}
        <Card className="overflow-hidden border-brand-200 bg-gradient-to-br from-brand-50 to-white dark:from-brand-900/30 dark:to-surface-900 dark:border-brand-900">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-brand-500 p-2.5 text-white shadow-card">
              <FileText className="size-5" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold leading-tight">
                {T.reports.title}
              </h2>
              <p className="mt-1 text-sm text-surface-600 dark:text-surface-300 leading-relaxed">
                {T.reports.subtitle}
              </p>
            </div>
          </div>
        </Card>

        {/* Range selector */}
        <Card>
          <CardHeader>
            <CardTitle>{T.reports.rangeTitle}</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-2 gap-2">
            {RANGE_OPTIONS.map((opt) => {
              const active = range === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setRange(opt.key)}
                  className={cn(
                    "rounded-2xl border p-3 text-right transition-all duration-150",
                    "focus:outline-none focus:ring-2 focus:ring-brand-500/40",
                    active
                      ? "border-brand-500 bg-brand-50 dark:bg-brand-900/30 shadow-card"
                      : "border-surface-200 bg-white hover:border-brand-200 hover:bg-brand-50/30 dark:border-surface-800 dark:bg-surface-900",
                  )}
                  aria-pressed={active}
                >
                  <div className="flex items-center justify-between">
                    <CalendarRange
                      className={cn(
                        "size-4",
                        active
                          ? "text-brand-600 dark:text-brand-300"
                          : "text-surface-400",
                      )}
                    />
                    <div className="text-sm font-semibold">{opt.label}</div>
                  </div>
                  <div className="mt-1 text-[11px] text-surface-500 dark:text-surface-300">
                    {opt.hint}
                  </div>
                </button>
              );
            })}
          </div>

          {range === "custom" ? (
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="from">{T.reports.customFrom}</Label>
                <Input
                  id="from"
                  type="date"
                  value={from}
                  max={to}
                  onChange={(e) => setFrom(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="to">{T.reports.customTo}</Label>
                <Input
                  id="to"
                  type="date"
                  value={to}
                  min={from}
                  max={todayISO()}
                  onChange={(e) => setTo(e.target.value)}
                />
              </div>
              {!customValid ? (
                <p className="col-span-2 text-xs text-danger">
                  {T.reports.errorMsg}
                </p>
              ) : null}
            </div>
          ) : null}
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle>{T.reports.summaryTitle}</CardTitle>
            {preview.data ? (
              <CardSubtle>
                {preview.data.from} – {preview.data.to}
              </CardSubtle>
            ) : null}
          </CardHeader>

          {preview.isLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-16 animate-pulse rounded-xl bg-surface-100 dark:bg-surface-800"
                />
              ))}
            </div>
          ) : preview.error ? (
            <p className="text-sm text-danger">
              {(preview.error as Error).message}
            </p>
          ) : noData ? (
            <p className="text-sm text-surface-500 dark:text-surface-300">
              {T.reports.noData}
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Stat
                label={T.reports.avgCalories}
                value={fmtNum(summary?.avgCalories ?? 0)}
                hint={T.reports.kcal}
              />
              <Stat
                label={T.reports.avgProtein}
                value={fmtNum(summary?.avgProtein ?? 0)}
                hint={T.reports.grams}
              />
              <Stat
                label={T.reports.totalCalories}
                value={fmtNum(summary?.totalCalories ?? 0)}
                hint={T.reports.kcal}
              />
              <Stat
                label={T.reports.totalProtein}
                value={fmtNum(summary?.totalProtein ?? 0)}
                hint={T.reports.grams}
              />
              <Stat
                label={T.reports.totalWorkouts}
                value={fmtNum(summary?.totalWorkouts ?? 0)}
                hint={
                  fmtNum(summary?.totalWorkoutMinutes ?? 0) +
                  " " +
                  T.reports.minutesShort
                }
              />
              <Stat
                label={T.reports.trackedDays}
                value={
                  (summary?.trackedDays ?? 0) +
                  "/" +
                  (summary?.totalDays ?? 0)
                }
                hint={T.reports.daysUnit}
              />
            </div>
          )}
        </Card>

        {/* Charts */}
        {!noData && charts ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>
                  <span className="inline-flex items-center gap-1.5">
                    <Apple className="size-4 text-brand-500" />
                    {T.reports.caloriesChart}
                  </span>
                </CardTitle>
              </CardHeader>
              <BarSeries
                data={caloriesPoints}
                unit={T.reports.kcal}
                colorVar="#0ea5e9"
              />
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  <span className="inline-flex items-center gap-1.5">
                    <ActivityIcon className="size-4 text-success" />
                    {T.reports.proteinChart}
                  </span>
                </CardTitle>
              </CardHeader>
              <BarSeries
                data={proteinPoints}
                unit={T.reports.grams}
                colorVar="#10b981"
              />
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  <span className="inline-flex items-center gap-1.5">
                    <Dumbbell className="size-4 text-warn" />
                    {T.reports.workoutsChart}
                  </span>
                </CardTitle>
              </CardHeader>
              <BarSeries
                data={workoutPoints}
                unit={T.reports.workoutCountUnit}
                colorVar="#f59e0b"
              />
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  <span className="inline-flex items-center gap-1.5">
                    <TrendingUp className="size-4 text-brand-500" />
                    {T.reports.trendsChart}
                  </span>
                </CardTitle>
              </CardHeader>
              <LineSeries
                data={netPoints}
                unit={T.reports.kcal}
                colorVar="#8b5cf6"
              />
            </Card>
          </>
        ) : null}

        {/* Daily history */}
        {!noData && preview.data?.days ? (
          <DailyHistory days={preview.data.days} />
        ) : null}

        {/* Delivery + export */}
        <Card className="border-brand-200 bg-brand-50/50 dark:bg-brand-900/20 dark:border-brand-900">
          <CardHeader>
            <CardTitle>
              <span className="inline-flex items-center gap-1.5">
                <Mail className="size-4 text-brand-600" />
                {T.reports.deliveryTitle}
              </span>
            </CardTitle>
          </CardHeader>
          <p className="text-sm text-surface-600 dark:text-surface-300">
            {T.reports.deliveryHint}
          </p>
          <Button
            onClick={() => exportMutation.mutate()}
            loading={isExporting}
            disabled={!customValid || isExporting || noData}
            size="lg"
            className="mt-3 w-full"
          >
            {isExporting ? (
              <>
                <Sparkles className="size-4 animate-pulse" />
                {T.reports.exporting}
              </>
            ) : (
              <>
                <Download className="size-4" />
                {T.reports.exportCta}
              </>
            )}
          </Button>
          {exportMutation.error && !toast ? (
            <p className="mt-2 text-xs text-danger">
              {(exportMutation.error as Error).message}
            </p>
          ) : null}
        </Card>
      </div>
    </>
  );
}
