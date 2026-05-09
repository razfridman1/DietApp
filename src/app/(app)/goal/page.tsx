"use client";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TrendingDown, TrendingUp, Equal, Target as TargetIcon, Check } from "lucide-react";
import { TopBar } from "@/components/nav/TopBar";
import { Card, CardHeader, CardTitle, CardSubtle } from "@/components/ui/Card";
import { Stat } from "@/components/ui/Stat";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Progress } from "@/components/ui/Progress";
import { LineSeries } from "@/components/charts/LineSeries";
import { api } from "@/lib/client-api";
import { fmtKcal, fmtKg, fmtNum, isoDate } from "@/lib/format";
import { etaToGoalDays } from "@/lib/calc/weightForecast";
import { calorieDelta, T } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Goal, GoalPace, TodayPayload } from "@/types";

const PACE_META: Record<GoalPace, { label: string; desc: string }> = {
  slow:   { label: T.goal.paceSlow,   desc: T.goal.paceSlowDesc },
  medium: { label: T.goal.paceMedium, desc: T.goal.paceMediumDesc },
  fast:   { label: T.goal.paceFast,   desc: T.goal.paceFastDesc },
};

const GOAL_META: Record<Goal, { label: string; desc: string; icon: any; tone: string }> = {
  cut: { label: T.goal.cut, desc: T.goal.cutDesc, icon: TrendingDown, tone: "text-danger" },
  bulk: { label: T.goal.bulk, desc: T.goal.bulkDesc, icon: TrendingUp, tone: "text-success" },
  maintain: { label: T.goal.maintain, desc: T.goal.maintainDesc, icon: Equal, tone: "text-brand-600" },
};

export default function GoalPage() {
  const qc = useQueryClient();
  const today = useQuery({
    queryKey: ["today"],
    queryFn: () => api.get<TodayPayload>("/api/daily/today"),
  });

  const profile = today.data?.profile;
  const [selectedGoal, setSelectedGoal] = useState<Goal>("maintain");
  const [selectedPace, setSelectedPace] = useState<GoalPace>("medium");
  const [targetWeight, setTargetWeight] = useState<string>("");
  const [proteinPerKg, setProteinPerKg] = useState<string>("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setSelectedGoal(profile.goal);
    setSelectedPace(profile.goal_pace ?? "medium");
    setTargetWeight(profile.target_weight_kg ? String(profile.target_weight_kg) : "");
    setProteinPerKg(profile.protein_per_kg ? String(profile.protein_per_kg) : "1.8");
  }, [profile?.id]); // eslint-disable-line

  const saveMut = useMutation({
    mutationFn: (body: any) => api.put("/api/goal", body),
    onSuccess: async () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["today"] }),
        qc.invalidateQueries({ queryKey: ["profile"] }),
      ]);
    },
  });

  function onSave() {
    saveMut.mutate({
      goal: selectedGoal,
      goal_pace: selectedPace,
      target_weight_kg: targetWeight ? Number(targetWeight) : null,
      protein_per_kg: proteinPerKg ? Number(proteinPerKg) : undefined,
    });
  }

  if (!today.data || !profile) {
    return (
      <>
        <TopBar title={T.goal.title} />
        <Card className="mt-4 h-40 animate-pulse" />
      </>
    );
  }

  const { tdee, log } = today.data;
  // For maintain, pace is irrelevant (always 0). For cut/bulk it determines the delta.
  const effectivePace: GoalPace = selectedGoal === "maintain" ? "medium" : selectedPace;
  const dailyDelta = calorieDelta(selectedGoal, effectivePace);
  // Live preview of the daily target based on the *currently selected* goal+pace,
  // not the saved one. Updates instantly when the user clicks a different card.
  const goalCalorieTarget = tdee + dailyDelta;
  const weeklyKg = (dailyDelta * 7) / 7700;

  const currentWeight = profile.weight_kg ?? 0;
  const target = targetWeight ? Number(targetWeight) : null;
  const etaDays =
    target && currentWeight && dailyDelta !== 0
      ? etaToGoalDays(currentWeight, target, dailyDelta)
      : null;

  const todayNet = Number(log.net_calories);
  const deltaToday = todayNet - goalCalorieTarget;
  const status =
    Math.abs(deltaToday) < 100 ? "onTrack" : deltaToday > 0 ? "over" : "under";

  // Project weight forward 8 weeks based on selected goal
  const projection: { date: string; value: number }[] = [];
  if (currentWeight) {
    for (let i = 0; i <= 56; i += 7) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      projection.push({
        date: isoDate(d),
        value: +(currentWeight + (dailyDelta / 7700) * i).toFixed(2),
      });
    }
  }

  return (
    <>
      <TopBar title={T.goal.title} />
      <div className="space-y-4 pt-4">
        <Card>
          <CardHeader>
            <CardTitle>{T.goal.subtitle}</CardTitle>
          </CardHeader>
          <div className="grid gap-2">
            {(Object.keys(GOAL_META) as Goal[]).map((g) => {
              const meta = GOAL_META[g];
              const Icon = meta.icon;
              const active = selectedGoal === g;
              return (
                <button
                  key={g}
                  onClick={() => setSelectedGoal(g)}
                  className={cn(
                    "flex items-start gap-3 rounded-xl border p-3 text-right transition",
                    active
                      ? "border-brand-500 bg-brand-50 dark:bg-brand-900/30"
                      : "border-surface-200 hover:bg-surface-50 dark:border-surface-800 dark:hover:bg-surface-800",
                  )}
                >
                  <div className={cn("rounded-lg p-2 bg-white dark:bg-surface-900 shadow-sm", meta.tone)}>
                    <Icon className="size-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{meta.label}</span>
                      {active ? <Check className="size-4 text-brand-600" /> : null}
                    </div>
                    <p className="text-xs text-surface-500 dark:text-surface-300">
                      {meta.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {selectedGoal !== "maintain" ? (
          <Card>
            <CardHeader>
              <CardTitle>{T.goal.pace}</CardTitle>
              <CardSubtle>
                {selectedGoal === "cut"
                  ? "כמה גירעון קלורי יומי תרצה/י"
                  : "כמה עודף קלורי יומי תרצה/י"}
              </CardSubtle>
            </CardHeader>
            <div className="grid grid-cols-3 gap-2">
              {(["slow", "medium", "fast"] as GoalPace[]).map((p) => {
                const meta = PACE_META[p];
                const active = selectedPace === p;
                const delta = calorieDelta(selectedGoal, p);
                const wk = (delta * 7) / 7700;
                return (
                  <button
                    key={p}
                    onClick={() => setSelectedPace(p)}
                    className={cn(
                      "flex flex-col gap-1 rounded-xl border p-3 text-center transition",
                      active
                        ? "border-brand-500 bg-brand-50 dark:bg-brand-900/30"
                        : "border-surface-200 hover:bg-surface-50 dark:border-surface-800 dark:hover:bg-surface-800",
                    )}
                  >
                    <span className="font-semibold">{meta.label}</span>
                    <span className="text-xs text-surface-500 dark:text-surface-300 tabular">
                      {delta > 0 ? "+" : ""}
                      {delta} קק״ל
                    </span>
                    <span
                      className={cn(
                        "text-xs tabular",
                        wk < 0 ? "text-success" : "text-warn",
                      )}
                    >
                      {wk >= 0 ? "+" : ""}
                      {fmtKg(wk, 2)} בשבוע
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-surface-500 dark:text-surface-300 leading-relaxed">
              {PACE_META[selectedPace].desc}
            </p>
          </Card>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>נתוני יעד</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-2 gap-3">
            <Stat label="צריכת קלוריות יומית" value={fmtKcal(tdee)} hint="הוצאה יומית" />
            <Stat
              label={T.dash.todayTarget}
              value={fmtKcal(goalCalorieTarget)}
              hint={
                selectedGoal === "cut"
                  ? T.goal.deficit
                  : selectedGoal === "bulk"
                    ? T.goal.surplus
                    : "איזון"
              }
            />
            <Stat
              label={T.goal.weeklyGoalKg}
              value={
                <span className={weeklyKg < 0 ? "text-success" : weeklyKg > 0 ? "text-warn" : ""}>
                  {weeklyKg >= 0 ? "+" : ""}
                  {fmtKg(weeklyKg, 2)}
                </span>
              }
            />
            <Stat
              label="סטטוס היום"
              value={
                <span
                  className={
                    status === "onTrack"
                      ? "text-success"
                      : status === "over"
                        ? "text-warn"
                        : "text-brand-600"
                  }
                >
                  {T.goal[status]}
                </span>
              }
              hint={
                status === "onTrack"
                  ? `${fmtNum(deltaToday)} קק״ל`
                  : status === "over"
                    ? `+${fmtNum(deltaToday)} קק״ל`
                    : `${fmtNum(deltaToday)} קק״ל`
              }
            />
          </div>
          <div className="mt-3">
            <Progress
              value={Number(log.calories_in)}
              max={Math.max(goalCalorieTarget, 1)}
              tone={status === "onTrack" ? "success" : status === "over" ? "warn" : "brand"}
            />
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{T.goal.targetWeight}</CardTitle>
            <CardSubtle>
              משקל נוכחי: {currentWeight ? fmtKg(currentWeight) : "—"}
            </CardSubtle>
          </CardHeader>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>{T.goal.targetWeight}</Label>
              <Input
                type="number"
                inputMode="decimal"
                value={targetWeight}
                onChange={(e) => setTargetWeight(e.target.value)}
                placeholder={currentWeight ? String(currentWeight) : "75"}
              />
            </div>
            <div>
              <Label>{T.goal.proteinPerKg}</Label>
              <Input
                type="number"
                inputMode="decimal"
                step="0.1"
                value={proteinPerKg}
                onChange={(e) => setProteinPerKg(e.target.value)}
                placeholder="1.8"
              />
            </div>
          </div>
          {etaDays != null ? (
            <div className="mt-3 rounded-xl bg-surface-50 p-3 text-sm dark:bg-surface-800">
              <div className="flex items-center gap-2">
                <TargetIcon className="size-4 text-brand-600" />
                <span className="font-medium">{T.goal.eta}:</span>
                <span className="tabular">
                  {etaDays >= 60
                    ? `${Math.round(etaDays / 30)} ${T.goal.months}`
                    : etaDays >= 14
                      ? `${Math.round(etaDays / 7)} ${T.goal.weeks}`
                      : `${etaDays} ${T.goal.days}`}
                </span>
              </div>
              <p className="mt-1 text-xs text-surface-500">
                בהנחה של עמידה ביעד הקלורי היומי
              </p>
            </div>
          ) : null}

          <Button
            onClick={onSave}
            loading={saveMut.isPending}
            className="mt-3 w-full"
            size="lg"
          >
            {saved ? T.goal.saved : T.goal.save}
          </Button>
        </Card>

        {projection.length > 1 ? (
          <Card>
            <CardHeader>
              <CardTitle>{T.goal.projection}</CardTitle>
              <CardSubtle>תחזית ל־8 שבועות</CardSubtle>
            </CardHeader>
            <LineSeries data={projection} unit="ק״ג" colorVar="#0ea5e9" />
          </Card>
        ) : null}
      </div>
    </>
  );
}
