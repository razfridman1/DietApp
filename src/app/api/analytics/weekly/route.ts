import { requireUser } from "@/lib/supabase/server";
import { json } from "@/lib/api-helpers";
import { lastNDates, todayISO } from "@/lib/format";
import { findAnomalies, summarize } from "@/lib/calc/analytics";
import type { DailyLog } from "@/types";

export async function GET(req: Request) {
  let session;
  try {
    session = await requireUser();
  } catch (r) {
    return r as Response;
  }
  const url = new URL(req.url);
  const days = Math.min(31, Math.max(2, Number(url.searchParams.get("days") || 7)));
  const end = url.searchParams.get("end") || todayISO();
  const dates = lastNDates(days, end);
  const start = dates[0];

  const { user, supabase } = session;
  const { data } = await supabase
    .from("daily_logs")
    .select("*")
    .eq("user_id", user.id)
    .gte("log_date", start)
    .lte("log_date", end)
    .order("log_date", { ascending: true });

  const map = new Map<string, DailyLog>();
  for (const r of (data ?? []) as DailyLog[]) map.set(r.log_date, r);

  const series: DailyLog[] = dates.map(
    (d) =>
      map.get(d) ?? {
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

  return json({
    days: series,
    summary: summarize(series.filter((d) => d.calories_in || d.calories_out)),
    anomalies: findAnomalies(series),
  });
}
