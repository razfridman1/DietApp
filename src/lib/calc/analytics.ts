import type { DailyLog, Meal, Activity } from "@/types";
import { parseISO, getDay, getHours } from "date-fns";

export interface DaySummary {
  date: string;
  calories_in: number;
  calories_out: number;
  protein_total: number;
  net: number;
}

export function summarize(days: DailyLog[]): {
  avgCalIn: number;
  avgCalOut: number;
  avgProtein: number;
  avgNet: number;
  total: number;
} {
  if (!days.length)
    return { avgCalIn: 0, avgCalOut: 0, avgProtein: 0, avgNet: 0, total: 0 };
  const sum = days.reduce(
    (acc, d) => {
      acc.cIn += Number(d.calories_in);
      acc.cOut += Number(d.calories_out);
      acc.p += Number(d.protein_total);
      acc.net += Number(d.net_calories);
      return acc;
    },
    { cIn: 0, cOut: 0, p: 0, net: 0 },
  );
  const n = days.length;
  return {
    avgCalIn: sum.cIn / n,
    avgCalOut: sum.cOut / n,
    avgProtein: sum.p / n,
    avgNet: sum.net / n,
    total: n,
  };
}

/** Days whose net calories deviate >1.5σ from the user's mean. */
export function findAnomalies(days: DailyLog[]): string[] {
  if (days.length < 4) return [];
  const nets = days.map((d) => Number(d.net_calories));
  const mean = nets.reduce((a, b) => a + b, 0) / nets.length;
  const variance =
    nets.reduce((acc, x) => acc + (x - mean) ** 2, 0) / nets.length;
  const sd = Math.sqrt(variance);
  if (sd === 0) return [];
  return days
    .filter((d) => Math.abs(Number(d.net_calories) - mean) > 1.5 * sd)
    .map((d) => d.log_date);
}

/** Behavior heuristics — these run server-side and feed the AI insight prompt. */
export interface BehaviorSignals {
  nightEatingRatio: number;
  weekendOverflow: number;
  proteinDeficitAvg: number;
  inactiveDays: number;
  totalDays: number;
}

export function analyzeBehavior(opts: {
  meals: Meal[];
  activities: Activity[];
  logs: DailyLog[];
  proteinTarget: number;
}): BehaviorSignals {
  const { meals, activities, logs, proteinTarget } = opts;
  const totalDays = Math.max(1, logs.length);

  // night eating: % of calories consumed after 20:00
  const totalCal = meals.reduce((s, m) => s + Number(m.calories), 0) || 1;
  const nightCal = meals.reduce((s, m) => {
    const h = getHours(parseISO(m.meal_time));
    return s + (h >= 20 || h < 4 ? Number(m.calories) : 0);
  }, 0);
  const nightEatingRatio = nightCal / totalCal;

  // weekend overflow: avg net on Fri/Sat (5,6) vs avg net rest
  const byDow: Record<number, number[]> = {};
  for (const l of logs) {
    const dow = getDay(parseISO(l.log_date));
    (byDow[dow] ||= []).push(Number(l.net_calories));
  }
  const avgArr = (a: number[] = []) =>
    a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
  const weekend = [...(byDow[5] || []), ...(byDow[6] || [])];
  const weekday = [
    ...(byDow[0] || []),
    ...(byDow[1] || []),
    ...(byDow[2] || []),
    ...(byDow[3] || []),
    ...(byDow[4] || []),
  ];
  const weekendOverflow = avgArr(weekend) - avgArr(weekday);

  // protein deficit
  const avgProtein = avgArr(logs.map((l) => Number(l.protein_total)));
  const proteinDeficitAvg = Math.max(0, proteinTarget - avgProtein);

  // inactive days
  const activeDays = new Set(activities.map((a) => a.log_date));
  const inactiveDays = logs.filter((l) => !activeDays.has(l.log_date)).length;

  return {
    nightEatingRatio,
    weekendOverflow,
    proteinDeficitAvg,
    inactiveDays,
    totalDays,
  };
}
