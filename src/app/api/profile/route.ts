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
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  if (error) return err(error.message, 400);
  return json(data);
}

const Schema = z.object({
  display_name: z.string().nullable().optional(),
  height_cm: z.number().positive().max(260).nullable().optional(),
  weight_kg: z.number().positive().max(400).nullable().optional(),
  gender: z.enum(["male", "female", "other"]).nullable().optional(),
  birth_year: z.number().int().min(1900).max(new Date().getFullYear()).nullable().optional(),
  activity_level: z.enum(["sedentary", "light", "moderate", "active", "very_active"]).optional(),
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
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq("id", user.id)
    .select()
    .maybeSingle();
  if (error) return err(error.message, 400);
  return json(data);
}
