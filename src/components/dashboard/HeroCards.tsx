"use client";
import { Card } from "@/components/ui/Card";
import { Stat } from "@/components/ui/Stat";
import { Progress } from "@/components/ui/Progress";
import { fmtKcal, fmtNum, fmtSignedKcal, fmtKg } from "@/lib/format";
import { T } from "@/lib/constants";
import type { TodayPayload } from "@/types";

export function HeroCards({ data }: { data: TodayPayload }) {
  const { log, tdee, proteinTarget, weightForecastKg, goalCalorieTarget } = data;
  const cIn = Number(log.calories_in);
  const cOut = Number(log.calories_out);
  const net = Number(log.net_calories);
  const protein = Number(log.protein_total);

  const calorieDelta = net - tdee; // positive = surplus

  // Remaining = budget − net (so logged exercise gives "credit" to eat more).
  // If negative, the user is over their target.
  const remainingToGoal = Math.round(goalCalorieTarget - net);
  const remainingToTdee = Math.round(tdee - net);

  const proteinPct = (protein / Math.max(1, proteinTarget)) * 100;
  const proteinTone =
    proteinPct >= 90 ? "success" : proteinPct >= 60 ? "warn" : "danger";

  const weeklyForecastKg = weightForecastKg * 7;

  return (
    <div className="space-y-3">
      {/* Calorie balance */}
      <Card>
        <div className="mb-3 flex items-baseline justify-between">
          <h3 className="text-sm font-medium text-surface-500 dark:text-surface-300">
            {T.dash.calorieBalance}
          </h3>
          <div className="flex flex-col items-end gap-0.5 text-xs text-surface-400 tabular">
            <span>
              {T.dash.todayTarget}: {fmtKcal(goalCalorieTarget)}
            </span>
            <span>צריכת קלוריות יומית: {fmtKcal(tdee)}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Stat label={T.dash.caloriesIn} value={fmtNum(cIn)} hint="קק״ל" />
          <Stat label={T.dash.caloriesOut} value={fmtNum(cOut)} hint="קק״ל" tone="success" />
        </div>
        <div className="mt-3">
          <Progress
            value={cIn}
            max={Math.max(goalCalorieTarget, 1)}
            tone={cIn > goalCalorieTarget ? "warn" : "brand"}
          />
        </div>

        {/* Remaining-to-target stats */}
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-surface-200 dark:border-surface-800 pt-4">
          <Stat
            label={T.dash.caloriesToGoal}
            value={
              <span className={remainingToGoal >= 0 ? "text-success" : "text-danger"}>
                {remainingToGoal >= 0 ? fmtNum(remainingToGoal) : `−${fmtNum(Math.abs(remainingToGoal))}`}
              </span>
            }
            hint={
              remainingToGoal >= 0
                ? `${T.dash.remaining} מתוך ${fmtNum(goalCalorieTarget)}`
                : `${T.dash.over} ביעד`
            }
          />
          <Stat
            label={T.dash.caloriesToTdee}
            value={
              <span className={remainingToTdee >= 0 ? "text-success" : "text-warn"}>
                {remainingToTdee >= 0 ? fmtNum(remainingToTdee) : `−${fmtNum(Math.abs(remainingToTdee))}`}
              </span>
            }
            hint={
              remainingToTdee >= 0
                ? `${T.dash.remaining} מתוך ${fmtNum(tdee)}`
                : `${T.dash.over} מצריכת קלוריות יומית`
            }
          />
        </div>
      </Card>

      {/* Protein */}
      <Card>
        <div className="mb-3 flex items-baseline justify-between">
          <h3 className="text-sm font-medium text-surface-500 dark:text-surface-300">
            {T.dash.proteinIntake}
          </h3>
          <span className="text-xs text-surface-400">
            {T.dash.proteinTarget}: {fmtNum(proteinTarget)} ג׳
          </span>
        </div>
        <Stat
          label="היום"
          value={`${fmtNum(protein)} / ${fmtNum(proteinTarget)} ג׳`}
          hint={`${fmtNum(proteinPct, 0)}%`}
          tone={proteinTone as any}
        />
        <div className="mt-3">
          <Progress value={protein} max={proteinTarget} tone={proteinTone as any} />
        </div>
      </Card>

      {/* Weight forecast */}
      <Card>
        <div className="mb-3">
          <h3 className="text-sm font-medium text-surface-500 dark:text-surface-300">
            {T.dash.weightForecast}
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Stat
            label="היום (משוער)"
            value={
              <span className={weightForecastKg < 0 ? "text-success" : weightForecastKg > 0 ? "text-warn" : ""}>
                {weightForecastKg >= 0 ? "+" : ""}
                {fmtKg(weightForecastKg, 2)}
              </span>
            }
            hint={`לפי צריכת קלוריות יומית של ${fmtKcal(tdee)}`}
          />
          <Stat
            label="לפי השבוע"
            value={
              <span className={weeklyForecastKg < 0 ? "text-success" : weeklyForecastKg > 0 ? "text-warn" : ""}>
                {weeklyForecastKg >= 0 ? "+" : ""}
                {fmtKg(weeklyForecastKg, 2)}
              </span>
            }
            hint={fmtSignedKcal(calorieDelta * 7)}
          />
        </div>
      </Card>
    </div>
  );
}
