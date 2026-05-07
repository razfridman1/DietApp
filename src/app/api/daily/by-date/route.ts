import { requireUser } from "@/lib/supabase/server";
import { err, json } from "@/lib/api-helpers";
import type { DailyLog, Meal, Activity } from "@/types";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(req: Request) {
  let session;
  try {
    session = await requireUser();
  } catch (r) {
    return r as Response;
  }
  const { user, supabase } = session;
  const url = new URL(req.url);
  const date = url.searchParams.get("date") || "";
  if (!DATE_RE.test(date)) return err("invalid date (expected YYYY-MM-DD)", 422);

  const [{ data: logRow }, { data: meals }, { data: activities }] = await Promise.all([
    supabase
      .from("daily_logs")
      .select("*")
      .eq("user_id", user.id)
      .eq("log_date", date)
      .maybeSingle(),
    supabase
      .from("meals")
      .select("*")
      .eq("user_id", user.id)
      .eq("log_date", date)
      .order("meal_time", { ascending: true }),
    supabase
      .from("activities")
      .select("*")
      .eq("user_id", user.id)
      .eq("log_date", date)
      .order("performed_at", { ascending: true }),
  ]);

  const log: DailyLog = (logRow as DailyLog) ?? {
    id: "",
    user_id: user.id,
    log_date: date,
    calories_in: 0,
    calories_out: 0,
    protein_total: 0,
    carbs_total: 0,
    fats_total: 0,
    net_calories: 0,
  };

  return json({
    date,
    log,
    meals: (meals ?? []) as Meal[],
    activities: (activities ?? []) as Activity[],
  });
}
