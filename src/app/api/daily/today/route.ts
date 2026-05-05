import { requireUser } from "@/lib/supabase/server";
import { json } from "@/lib/api-helpers";
import { tdee } from "@/lib/calc/tdee";
import { proteinTarget } from "@/lib/calc/proteinTarget";
import { dailyForecastKg } from "@/lib/calc/weightForecast";
import { calorieDelta } from "@/lib/constants";
import { todayISO } from "@/lib/format";
import type { Profile, DailyLog, Meal, Activity, TodayPayload } from "@/types";

export async function GET(req: Request) {
  let session;
  try {
    session = await requireUser();
  } catch (r) {
    return r as Response;
  }
  const { user, supabase } = session;
  const url = new URL(req.url);
  const date = url.searchParams.get("date") || todayISO();

  // ensure profile exists (it should via trigger, but be safe)
  const { data: profileRow } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const profile: Profile = (profileRow as Profile) ?? {
    id: user.id,
    email: user.email ?? "",
    display_name: null,
    height_cm: null,
    weight_kg: null,
    gender: null,
    birth_year: null,
    activity_level: "sedentary",
    goal: "maintain",
    goal_pace: "medium",
    target_weight_kg: null,
    protein_per_kg: 1.8,
  };

  // ensure daily_log exists
  await supabase
    .from("daily_logs")
    .upsert(
      { user_id: user.id, log_date: date },
      { onConflict: "user_id,log_date", ignoreDuplicates: true },
    );

  const [{ data: logData }, { data: meals }, { data: activities }] = await Promise.all([
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

  const log = (logData as DailyLog) ?? {
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

  const userTdee = tdee(profile);
  const proteinT = proteinTarget(profile);
  const goalDelta = calorieDelta(profile.goal, profile.goal_pace ?? "medium");
  const goalCalorieTarget = userTdee + goalDelta;
  const forecast = dailyForecastKg(Number(log.net_calories), userTdee);

  const payload: TodayPayload = {
    profile,
    log,
    meals: (meals ?? []) as Meal[],
    activities: (activities ?? []) as Activity[],
    tdee: userTdee,
    proteinTarget: proteinT,
    weightForecastKg: forecast,
    goalCalorieTarget,
  };
  return json(payload);
}
