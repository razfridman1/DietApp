import { requireUser } from "@/lib/supabase/server";
import { err, json } from "@/lib/api-helpers";
import { todayISO } from "@/lib/format";
import { tdee } from "@/lib/calc/tdee";
import { proteinTarget } from "@/lib/calc/proteinTarget";
import { calorieDelta } from "@/lib/constants";
import { whatsMissing } from "@/lib/ai/dashboardTip";
import type { Profile, DailyLog, Meal } from "@/types";

/**
 * GET — return today's cached tip if one exists, or null.
 *       Never calls the AI.
 */
export async function GET() {
  let session;
  try {
    session = await requireUser();
  } catch (r) {
    return r as Response;
  }
  const { user, supabase } = session;
  const date = todayISO();

  const { data } = await supabase
    .from("dashboard_tip_cache")
    .select("payload, updated_at")
    .eq("user_id", user.id)
    .eq("log_date", date)
    .maybeSingle();

  return json({
    payload: data?.payload ?? null,
    cachedAt: data?.updated_at ?? null,
  });
}

/**
 * POST — always run the AI fresh, then upsert into the cache.
 *        Used when the user clicks "ניתוח" / "רענון".
 */
export async function POST(_req: Request) {
  let session;
  try {
    session = await requireUser();
  } catch (r) {
    return r as Response;
  }
  const { user, supabase } = session;
  const date = todayISO();

  const [{ data: profileRow }, { data: logData }, { data: meals }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase
      .from("daily_logs")
      .select("*")
      .eq("user_id", user.id)
      .eq("log_date", date)
      .maybeSingle(),
    supabase
      .from("meals")
      .select("name, calories, protein")
      .eq("user_id", user.id)
      .eq("log_date", date)
      .order("meal_time", { ascending: true }),
  ]);

  const profile = profileRow as Profile | null;
  const log = logData as DailyLog | null;
  if (!profile) return err("profile_not_found", 404);

  const userTdee = tdee(profile);
  const proteinT = proteinTarget(profile);
  const goalDelta = calorieDelta(profile.goal, profile.goal_pace ?? "medium");
  const goalCalories = userTdee + goalDelta;

  try {
    const payload = await whatsMissing({
      caloriesIn: Number(log?.calories_in ?? 0),
      caloriesOut: Number(log?.calories_out ?? 0),
      proteinIn: Number(log?.protein_total ?? 0),
      carbsIn: Number(log?.carbs_total ?? 0),
      fatsIn: Number(log?.fats_total ?? 0),
      goalCalories,
      proteinTarget: proteinT,
      meals: ((meals ?? []) as Pick<Meal, "name" | "calories" | "protein">[]).map((m) => ({
        name: m.name,
        calories: Number(m.calories),
        protein: Number(m.protein),
      })),
      goal: profile.goal,
    });

    // Upsert cache for today.  Each subsequent POST overwrites the row.
    await supabase
      .from("dashboard_tip_cache")
      .upsert(
        {
          user_id: user.id,
          log_date: date,
          payload,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,log_date" },
      );

    return json({ payload, cached: false });
  } catch (e: any) {
    return err("ai_dashboard_tip_failed: " + (e?.message || "unknown"), 502);
  }
}
