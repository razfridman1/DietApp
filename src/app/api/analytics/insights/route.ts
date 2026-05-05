import { requireUser } from "@/lib/supabase/server";
import { err, json } from "@/lib/api-helpers";
import { analyzeBehavior, summarize } from "@/lib/calc/analytics";
import { generateInsights } from "@/lib/ai/insights";
import { tdee } from "@/lib/calc/tdee";
import { proteinTarget } from "@/lib/calc/proteinTarget";
import { lastNDates, todayISO } from "@/lib/format";
import type { Activity, DailyLog, Meal, Profile } from "@/types";

export async function GET() {
  let session;
  try {
    session = await requireUser();
  } catch (r) {
    return r as Response;
  }
  const { user, supabase } = session;

  // return cached insights from the last 24 hours
  const { data: cached } = await supabase
    .from("ai_insights")
    .select("*")
    .eq("user_id", user.id)
    .gte("created_at", new Date(Date.now() - 86_400_000).toISOString())
    .order("created_at", { ascending: false });

  return json({ insights: cached ?? [] });
}

export async function POST() {
  let session;
  try {
    session = await requireUser();
  } catch (r) {
    return r as Response;
  }
  const { user, supabase } = session;
  const end = todayISO();
  const dates = lastNDates(21, end);
  const start = dates[0];

  const [profileR, logsR, mealsR, actsR] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase
      .from("daily_logs")
      .select("*")
      .eq("user_id", user.id)
      .gte("log_date", start)
      .lte("log_date", end),
    supabase
      .from("meals")
      .select("*")
      .eq("user_id", user.id)
      .gte("log_date", start)
      .lte("log_date", end),
    supabase
      .from("activities")
      .select("*")
      .eq("user_id", user.id)
      .gte("log_date", start)
      .lte("log_date", end),
  ]);

  const profile = profileR.data as Profile | null;
  if (!profile) return err("profile not found", 404);

  const logs = (logsR.data ?? []) as DailyLog[];
  const meals = (mealsR.data ?? []) as Meal[];
  const acts = (actsR.data ?? []) as Activity[];

  if (logs.length < 3) {
    return json({ insights: [], reason: "not_enough_data" });
  }

  const ptarget = proteinTarget(profile);
  const userTdee = tdee(profile);
  const sig = analyzeBehavior({
    meals,
    activities: acts,
    logs,
    proteinTarget: ptarget,
  });
  const sum = summarize(logs);

  let generated;
  try {
    generated = await generateInsights({
      ...sig,
      goal: profile.goal,
      proteinTarget: ptarget,
      avgProtein: sum.avgProtein,
      avgNet: sum.avgNet,
      tdee: userTdee,
    });
  } catch (e: any) {
    return err("ai_failed: " + (e?.message || "unknown"), 502);
  }

  // wipe today's auto insights & insert new
  await supabase
    .from("ai_insights")
    .delete()
    .eq("user_id", user.id)
    .eq("generated_for_date", end);

  const rows = generated.map((g) => ({
    user_id: user.id,
    category: g.category,
    severity: g.severity,
    insight_text: g.insight_text,
    recommendation: g.recommendation,
    generated_for_date: end,
  }));

  if (rows.length) {
    const { data, error } = await supabase.from("ai_insights").insert(rows).select();
    if (error) return err(error.message, 400);
    return json({ insights: data });
  }
  return json({ insights: [] });
}
