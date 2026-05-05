import { requireUser } from "@/lib/supabase/server";
import { json } from "@/lib/api-helpers";
import { lastNDates, todayISO } from "@/lib/format";
import { summarize } from "@/lib/calc/analytics";
import type { DailyLog, WeightEntry } from "@/types";

export async function GET(req: Request) {
  let session;
  try {
    session = await requireUser();
  } catch (r) {
    return r as Response;
  }
  const url = new URL(req.url);
  const days = Math.min(120, Math.max(7, Number(url.searchParams.get("days") || 30)));
  const end = url.searchParams.get("end") || todayISO();
  const dates = lastNDates(days, end);
  const start = dates[0];

  const { user, supabase } = session;
  const [{ data: logs }, { data: weights }] = await Promise.all([
    supabase
      .from("daily_logs")
      .select("*")
      .eq("user_id", user.id)
      .gte("log_date", start)
      .lte("log_date", end)
      .order("log_date", { ascending: true }),
    supabase
      .from("weight_history")
      .select("*")
      .eq("user_id", user.id)
      .gte("log_date", start)
      .lte("log_date", end)
      .order("log_date", { ascending: true }),
  ]);

  const logMap = new Map<string, DailyLog>();
  for (const r of (logs ?? []) as DailyLog[]) logMap.set(r.log_date, r);

  const days_arr: DailyLog[] = dates.map(
    (d) =>
      logMap.get(d) ?? {
        id: "",
        user_id: user.id,
        log_date: d,
        calories_in: 0,
        calories_out: 0,
        protein_total: 0,
        carbs_total: 0,
        fats_total: 0,
        net_calories: 0,
      },
  );

  // consistency: % of days with at least 1 meal logged
  const loggedDays = (logs ?? []).filter((l: DailyLog) => Number(l.calories_in) > 0).length;
  const consistency = loggedDays / days;

  return json({
    days: days_arr,
    weights: (weights ?? []) as WeightEntry[],
    summary: summarize(days_arr.filter((d) => d.calories_in || d.calories_out)),
    consistency,
  });
}
