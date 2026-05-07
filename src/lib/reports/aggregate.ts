// Server-side aggregation of meals, activities, and daily logs into a
// structured report payload. All queries are filtered by the authenticated
// user's id — never accept a userId from the request body.
import type { SupabaseClient } from "@supabase/supabase-js";
import { isoDate, todayISO } from "@/lib/format";
import type { Activity, DailyLog, Meal, Profile } from "@/types";
import type {
  ReportCharts,
  ReportDayDetail,
  ReportPayload,
  ReportRange,
  ReportSummary,
} from "./types";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Resolve a (range, from, to) triple to concrete inclusive ISO dates. */
export function resolveRange(input: {
  range: ReportRange;
  from?: string;
  to?: string;
}): { from: string; to: string } {
  const today = new Date(todayISO() + "T00:00:00");
  const subtract = (days: number) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (days - 1));
    return isoDate(d);
  };

  if (input.range === "custom") {
    if (!input.from || !DATE_RE.test(input.from))
      throw new Error("invalid from date");
    if (!input.to || !DATE_RE.test(input.to)) throw new Error("invalid to date");
    if (input.from > input.to) throw new Error("from must be <= to");
    // Cap custom range at 365 days to avoid abuse.
    const fromDate = new Date(input.from + "T00:00:00");
    const toDate = new Date(input.to + "T00:00:00");
    const span =
      Math.round((toDate.getTime() - fromDate.getTime()) / 86_400_000) + 1;
    if (span > 366) throw new Error("custom range cannot exceed 366 days");
    return { from: input.from, to: input.to };
  }

  if (input.range === "weekly") return { from: subtract(7), to: todayISO() };
  if (input.range === "monthly") return { from: subtract(30), to: todayISO() };
  if (input.range === "yearly") return { from: subtract(365), to: todayISO() };
  throw new Error("invalid range");
}

/** Inclusive list of YYYY-MM-DD between two dates. */
function datesBetween(from: string, to: string): string[] {
  const out: string[] = [];
  const start = new Date(from + "T00:00:00");
  const end = new Date(to + "T00:00:00");
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    out.push(isoDate(d));
  }
  return out;
}

/** Empty placeholder for a date with no daily_log row. */
function emptyLog(userId: string, date: string): DailyLog {
  return {
    id: "",
    user_id: userId,
    log_date: date,
    calories_in: 0,
    calories_out: 0,
    protein_total: 0,
    carbs_total: 0,
    fats_total: 0,
    net_calories: 0,
  };
}

interface AggregatedReport {
  profile: Pick<Profile, "id" | "email" | "display_name">;
  summary: ReportSummary;
  charts: ReportCharts;
  days: ReportDayDetail[];
  from: string;
  to: string;
}

/** Build the full report payload (without the AI summary). */
export async function buildReport(
  supabase: SupabaseClient,
  user: { id: string; email?: string | null },
  range: { from: string; to: string },
): Promise<AggregatedReport> {
  const { from, to } = range;

  const [
    { data: profileRow, error: profileErr },
    { data: logs, error: logsErr },
    { data: meals, error: mealsErr },
    { data: activities, error: actErr },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id,email,display_name")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("daily_logs")
      .select("*")
      .eq("user_id", user.id)
      .gte("log_date", from)
      .lte("log_date", to)
      .order("log_date", { ascending: true }),
    supabase
      .from("meals")
      .select("*")
      .eq("user_id", user.id)
      .gte("log_date", from)
      .lte("log_date", to)
      .order("meal_time", { ascending: true }),
    supabase
      .from("activities")
      .select("*")
      .eq("user_id", user.id)
      .gte("log_date", from)
      .lte("log_date", to)
      .order("performed_at", { ascending: true }),
  ]);

  if (profileErr) throw new Error(profileErr.message);
  if (logsErr) throw new Error(logsErr.message);
  if (mealsErr) throw new Error(mealsErr.message);
  if (actErr) throw new Error(actErr.message);

  const profile: Pick<Profile, "id" | "email" | "display_name"> =
    (profileRow as Pick<Profile, "id" | "email" | "display_name"> | null) ?? {
      id: user.id,
      email: user.email ?? "",
      display_name: null,
    };

  const logsByDate = new Map<string, DailyLog>();
  for (const l of (logs ?? []) as DailyLog[]) logsByDate.set(l.log_date, l);
  const mealsByDate = new Map<string, Meal[]>();
  for (const m of (meals ?? []) as Meal[]) {
    const arr = mealsByDate.get(m.log_date) ?? [];
    arr.push(m);
    mealsByDate.set(m.log_date, arr);
  }
  const actByDate = new Map<string, Activity[]>();
  for (const a of (activities ?? []) as Activity[]) {
    const arr = actByDate.get(a.log_date) ?? [];
    arr.push(a);
    actByDate.set(a.log_date, arr);
  }

  const dates = datesBetween(from, to);

  // Build per-day details for every date in range, even empty days.
  const days: ReportDayDetail[] = dates.map((date) => {
    const log = logsByDate.get(date) ?? emptyLog(user.id, date);
    const dayMeals = mealsByDate.get(date) ?? [];
    const dayActs = actByDate.get(date) ?? [];
    const workoutMinutes = dayActs.reduce(
      (s, a) => s + Number(a.duration_min || 0),
      0,
    );
    return {
      date,
      log,
      meals: dayMeals,
      activities: dayActs,
      workoutCount: dayActs.length,
      workoutMinutes,
    };
  });

  // Filter to days that have any data for averages and totals.
  const tracked = days.filter(
    (d) =>
      d.meals.length > 0 ||
      d.activities.length > 0 ||
      Number(d.log.calories_in) > 0 ||
      Number(d.log.calories_out) > 0,
  );

  const totalCalories = tracked.reduce(
    (s, d) => s + Number(d.log.calories_in || 0),
    0,
  );
  const totalProtein = tracked.reduce(
    (s, d) => s + Number(d.log.protein_total || 0),
    0,
  );
  const totalWorkouts = days.reduce((s, d) => s + d.workoutCount, 0);
  const totalWorkoutMinutes = days.reduce((s, d) => s + d.workoutMinutes, 0);

  const summary: ReportSummary = {
    trackedDays: tracked.length,
    totalDays: dates.length,
    avgCalories: tracked.length ? totalCalories / tracked.length : 0,
    avgProtein: tracked.length ? totalProtein / tracked.length : 0,
    totalCalories,
    totalProtein,
    totalWorkouts,
    totalWorkoutMinutes,
  };

  const charts: ReportCharts = {
    calories: days.map((d) => ({
      date: d.date,
      value: Number(d.log.calories_in || 0),
    })),
    protein: days.map((d) => ({
      date: d.date,
      value: Number(d.log.protein_total || 0),
    })),
    workouts: days.map((d) => ({ date: d.date, value: d.workoutCount })),
    net: days.map((d) => ({
      date: d.date,
      value: Number(d.log.net_calories || 0),
    })),
  };

  return { profile, summary, charts, days, from, to };
}

export function emptyPayload(
  user: { id: string; email?: string | null },
  range: { from: string; to: string; range: ReportRange },
): ReportPayload {
  return {
    range: range.range,
    from: range.from,
    to: range.to,
    generatedAt: new Date().toISOString(),
    profile: { id: user.id, email: user.email ?? "", display_name: null },
    summary: {
      trackedDays: 0,
      totalDays: 0,
      avgCalories: 0,
      avgProtein: 0,
      totalCalories: 0,
      totalProtein: 0,
      totalWorkouts: 0,
      totalWorkoutMinutes: 0,
    },
    charts: { calories: [], protein: [], workouts: [], net: [] },
    days: [],
    aiSummary: null,
  };
}
