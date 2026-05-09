import { z } from "zod";
import { requireUser } from "@/lib/supabase/server";
import { err, json, readBody } from "@/lib/api-helpers";
import { todayISO } from "@/lib/format";
import type { DailyIntakeItem } from "@/lib/health/types";

const PostSchema = z.object({
  name: z.string().min(1).max(120),
  kind: z.enum(["food", "drink"]).default("food"),
  qty_value: z.number().nullable().optional(),
  qty_unit: z.enum(["g", "ml", "unit"]).default("g"),
  rating: z.number().int().min(1).max(10).nullable().optional(),
  notes: z.string().max(400).nullable().optional(),
  color: z.string().max(20).nullable().optional(),
  category: z.string().max(40).nullable().optional(),
  log_date: z.string().optional(),
  consumed_at: z.string().optional(),
});

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

  // Pull custom intake items (food + drink logged in the Health tab)
  // and dashboard meals (food logged in the existing /dashboard tab) in parallel.
  const [{ data: intake }, { data: meals }] = await Promise.all([
    supabase
      .from("daily_intake")
      .select("*")
      .eq("user_id", user.id)
      .eq("log_date", date)
      .order("consumed_at", { ascending: true }),
    supabase
      .from("meals")
      .select("id, name, grams, calories, protein, carbs, fats, meal_time, log_date, user_id")
      .eq("user_id", user.id)
      .eq("log_date", date)
      .order("meal_time", { ascending: true }),
  ]);

  const intakeItems: DailyIntakeItem[] = ((intake ?? []) as DailyIntakeItem[]).map((it) => ({
    ...it,
    source: "intake" as const,
  }));

  const mealItems: DailyIntakeItem[] = (meals ?? []).map((m: any) => ({
    id: m.id,
    user_id: m.user_id,
    log_date: m.log_date,
    name: m.name,
    kind: "food",
    qty_value: m.grams ?? null,
    qty_unit: "g",
    rating: null,
    notes: null,
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

  // Merge by consumed_at ascending
  const items = [...mealItems, ...intakeItems].sort((a, b) =>
    (a.consumed_at ?? "").localeCompare(b.consumed_at ?? ""),
  );

  return json({ items, date });
}

export async function POST(req: Request) {
  let session;
  try {
    session = await requireUser();
  } catch (r) {
    return r as Response;
  }
  const body = await readBody(req, PostSchema);
  if (body instanceof Response) return body;

  const { user, supabase } = session;
  const log_date = body.log_date || todayISO();

  const { data, error } = await supabase
    .from("daily_intake")
    .insert({
      user_id: user.id,
      name: body.name,
      kind: body.kind,
      qty_value: body.qty_value ?? null,
      qty_unit: body.qty_unit,
      rating: body.rating ?? null,
      notes: body.notes ?? null,
      color: body.color ?? null,
      category: body.category ?? null,
      log_date,
      consumed_at: body.consumed_at ?? new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error) return err(error.message, 400);
  return json({ item: { ...(data as DailyIntakeItem), source: "intake" } });
}
