import { requireUser } from "@/lib/supabase/server";
import { json } from "@/lib/api-helpers";
import { datesBetween, lastNDates, todayISO } from "@/lib/format";
import { findAnomalies, summarize } from "@/lib/calc/analytics";
import type { DailyLog } from "@/types";

const ISO_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(req: Request) {
  let session;
  try {
    session = await requireUser();
  } catch (r) {
    return r as Response;
  }
  const url = new URL(req.url);
  const startParam = url.searchParams.get("start");
  const endParam = url.searchParams.get("end") || todayISO();
  const end = ISO_RE.test(endParam) ? endParam : todayISO();

  let start: string;
  let dates: string[];

  if (startParam && ISO_RE.test(startParam) && startParam <= end) {
    // Custom range mode — bound it to 366 days for safety.
    const all = datesBetween(startParam, end);
    dates = all.length > 366 ? all.slice(all.length - 366) : all;
    start = dates[0];
  } else {
    const days = Math.min(31, Math.max(2, Number(url.searchParams.get("days") || 7)));
    dates = lastNDates(days, end);
    start = dates[0];
  }

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
