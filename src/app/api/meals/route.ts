import { z } from "zod";
import { requireUser } from "@/lib/supabase/server";
import { err, json, readBody } from "@/lib/api-helpers";
import { todayISO } from "@/lib/format";

const Schema = z.object({
  log_date: z.string().optional(),
  name: z.string().min(1),
  grams: z.number().nullable().optional(),
  calories: z.number().nonnegative(),
  protein: z.number().nonnegative(),
  carbs: z.number().nonnegative().default(0),
  fats: z.number().nonnegative().default(0),
  meal_time: z.string().optional(),
  ai_generated: z.boolean().default(false),
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
  const log_date = body.log_date ?? todayISO();

  const { data: log } = await supabase
    .from("daily_logs")
    .upsert(
      { user_id: user.id, log_date },
      { onConflict: "user_id,log_date" },
    )
    .select()
    .maybeSingle();

  const { data, error } = await supabase
    .from("meals")
    .insert({
      user_id: user.id,
      daily_log_id: log?.id ?? null,
      log_date,
      name: body.name,
      grams: body.grams ?? null,
      calories: body.calories,
      protein: body.protein,
      carbs: body.carbs,
      fats: body.fats,
      meal_time: body.meal_time ?? new Date().toISOString(),
      ai_generated: body.ai_generated,
    })
    .select()
    .single();

  if (error) return err(error.message, 400);
  return json(data, { status: 201 });
}
