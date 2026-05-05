import { z } from "zod";
import { requireUser } from "@/lib/supabase/server";
import { err, json, readBody } from "@/lib/api-helpers";
import { todayISO } from "@/lib/format";

const Schema = z.object({
  log_date: z.string().optional(),
  type: z.enum(["walk", "run", "gym", "swim", "cycle", "yoga", "other"]),
  description: z.string().optional(),
  duration_min: z.number().positive(),
  intensity: z.enum(["low", "moderate", "high"]).default("moderate"),
  calories_burned: z.number().nonnegative(),
  performed_at: z.string().optional(),
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
    .from("activities")
    .insert({
      user_id: user.id,
      daily_log_id: log?.id ?? null,
      log_date,
      type: body.type,
      description: body.description ?? null,
      duration_min: body.duration_min,
      intensity: body.intensity,
      calories_burned: body.calories_burned,
      performed_at: body.performed_at ?? new Date().toISOString(),
      ai_generated: body.ai_generated,
    })
    .select()
    .single();

  if (error) return err(error.message, 400);
  return json(data, { status: 201 });
}
