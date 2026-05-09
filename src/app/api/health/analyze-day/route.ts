import { z } from "zod";
import { requireUser } from "@/lib/supabase/server";
import { err, json, readBody } from "@/lib/api-helpers";
import { todayISO } from "@/lib/format";
import { analyzeDay } from "@/lib/ai/dayAnalysis";
import type { DailyIntakeItem } from "@/lib/health/types";

const Schema = z.object({
  date: z.string().optional(),
  lang: z.enum(["he", "en"]).default("he"),
  refresh: z.boolean().default(false),
});

export async function POST(req: Request) {
  let session;
  try {
    session = await requireUser();
  } catch (r) {
    return r as Response;
  }
  const body = await readBody(req, Schema);
  if (body instanceof Response) return body;
  const { user, supabase } = session;
  const date = body.date || todayISO();

  // Cache hit
  if (!body.refresh) {
    const { data: cached } = await supabase
      .from("daily_intake_analysis")
      .select("payload, created_at")
      .eq("user_id", user.id)
      .eq("log_date", date)
      .maybeSingle();
    if (cached?.payload) {
      return json({ payload: cached.payload, cached: true });
    }
  }

  const [{ data: intake }, { data: meals }, { data: profile }] = await Promise.all([
    supabase
      .from("daily_intake")
      .select("*")
      .eq("user_id", user.id)
      .eq("log_date", date),
    supabase
      .from("meals")
      .select("id, name, grams, calories, protein, carbs, fats, meal_time, log_date, user_id")
      .eq("user_id", user.id)
      .eq("log_date", date),
    supabase.from("profiles").select("weight_kg, goal").eq("id", user.id).maybeSingle(),
  ]);

  const intakeItems = ((intake ?? []) as DailyIntakeItem[]).map((it) => ({
    ...it,
    source: "intake" as const,
  }));
  const mealItems: DailyIntakeItem[] = (meals ?? []).map((m: any) => ({
    id: m.id,
    user_id: m.user_id,
    log_date: m.log_date,
    name: m.name,
    kind: "food" as const,
    qty_value: m.grams ?? null,
    qty_unit: "g" as const,
    rating: null,
    notes:
      `≈ ${Math.round(Number(m.calories ?? 0))} kcal | P ${Math.round(Number(m.protein ?? 0))}g` +
      ` | C ${Math.round(Number(m.carbs ?? 0))}g | F ${Math.round(Number(m.fats ?? 0))}g`,
    color: null,
    category: null,
    consumed_at: m.meal_time ?? new Date().toISOString(),
    created_at: m.meal_time ?? new Date().toISOString(),
    source: "meal" as const,
    calories: m.calories ?? null,
    protein: m.protein ?? null,
    carbs: m.carbs ?? null,
    fats: m.fats ?? null,
  }));

  const items = [...mealItems, ...intakeItems].sort((a, b) =>
    (a.consumed_at ?? "").localeCompare(b.consumed_at ?? ""),
  );

  try {
    const payload = await analyzeDay(items, {
      lang: body.lang,
      profile: profile ?? undefined,
    });
    await supabase
      .from("daily_intake_analysis")
      .upsert(
        {
          user_id: user.id,
          log_date: date,
          score: payload.score,
          status: payload.status,
          payload,
        },
        { onConflict: "user_id,log_date" },
      );
    return json({ payload, cached: false });
  } catch (e: any) {
    return err("ai_day_analysis_failed: " + (e?.message || "unknown"), 502);
  }
}
