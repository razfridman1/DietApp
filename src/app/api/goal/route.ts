import { z } from "zod";
import { requireUser } from "@/lib/supabase/server";
import { err, json, readBody } from "@/lib/api-helpers";

export async function GET() {
  let session;
  try {
    session = await requireUser();
  } catch (r) {
    return r as Response;
  }
  const { user, supabase } = session;
  const { data, error } = await supabase
    .from("profiles")
    .select("goal,goal_pace,target_weight_kg,protein_per_kg,weight_kg")
    .eq("id", user.id)
    .maybeSingle();
  if (error) return err(error.message, 400);
  return json(data);
}

const Schema = z.object({
  goal: z.enum(["cut", "bulk", "maintain"]),
  goal_pace: z.enum(["slow", "medium", "fast"]).optional(),
  target_weight_kg: z.number().positive().nullable().optional(),
  protein_per_kg: z.number().positive().max(4).optional(),
});

export async function PUT(req: Request) {
  let session;
  try {
    session = await requireUser();
  } catch (r) {
    return r as Response;
  }
  const body = await readBody(req, Schema);
  if (body instanceof Response) return body;

  const { user, supabase } = session;
  const { data, error } = await supabase
    .from("profiles")
    .update({
      goal: body.goal,
      goal_pace: body.goal_pace ?? "medium",
      target_weight_kg: body.target_weight_kg ?? null,
      protein_per_kg: body.protein_per_kg ?? undefined,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)
    .select()
    .maybeSingle();
  if (error) return err(error.message, 400);
  return json(data);
}
