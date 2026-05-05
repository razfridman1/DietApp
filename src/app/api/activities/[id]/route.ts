import { z } from "zod";
import { requireUser } from "@/lib/supabase/server";
import { err, json, readBody } from "@/lib/api-helpers";

const Patch = z.object({
  type: z.enum(["walk", "run", "gym", "swim", "cycle", "yoga", "other"]).optional(),
  description: z.string().nullable().optional(),
  duration_min: z.number().positive().optional(),
  intensity: z.enum(["low", "moderate", "high"]).optional(),
  calories_burned: z.number().nonnegative().optional(),
  performed_at: z.string().optional(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  let session;
  try {
    session = await requireUser();
  } catch (r) {
    return r as Response;
  }
  const { id } = await ctx.params;
  const body = await readBody(req, Patch);
  if (body instanceof Response) return body;

  const { supabase, user } = session;
  const { data, error } = await supabase
    .from("activities")
    .update(body)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .maybeSingle();

  if (error) return err(error.message, 400);
  if (!data) return err("not found", 404);
  return json(data);
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  let session;
  try {
    session = await requireUser();
  } catch (r) {
    return r as Response;
  }
  const { id } = await ctx.params;
  const { supabase, user } = session;
  const { error } = await supabase
    .from("activities")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return err(error.message, 400);
  return json({ ok: true });
}
