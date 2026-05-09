import { z } from "zod";
import { requireUser } from "@/lib/supabase/server";
import { err, json, readBody } from "@/lib/api-helpers";

const PatchSchema = z.object({
  body: z.string().min(1).max(2000).optional(),
  mood: z.enum(["great", "good", "ok", "tired", "bad"]).nullable().optional(),
  tags: z.array(z.string().min(1).max(30)).max(15).optional(),
  color: z.string().max(20).nullable().optional(),
  category: z.string().max(40).nullable().optional(),
  food_mentioned: z.string().max(120).nullable().optional(),
  food_rating: z.number().int().min(1).max(10).nullable().optional(),
});

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  let session;
  try {
    session = await requireUser();
  } catch (r) {
    return r as Response;
  }
  const { id } = await ctx.params;
  const body = await readBody(req, PatchSchema);
  if (body instanceof Response) return body;
  const { user, supabase } = session;
  const { data, error } = await supabase
    .from("health_notes")
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("*")
    .single();
  if (error) return err(error.message, 400);
  return json({ note: data });
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  let session;
  try {
    session = await requireUser();
  } catch (r) {
    return r as Response;
  }
  const { id } = await ctx.params;
  const { user, supabase } = session;
  const { error } = await supabase
    .from("health_notes")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return err(error.message, 400);
  return json({ ok: true });
}

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  // Duplicate
  let session;
  try {
    session = await requireUser();
  } catch (r) {
    return r as Response;
  }
  const { id } = await ctx.params;
  const { user, supabase } = session;

  const { data: original, error: gErr } = await supabase
    .from("health_notes")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (gErr || !original) return err("not_found", 404);

  const { id: _id, created_at: _c, updated_at: _u, ...rest } = original;
  const { data, error } = await supabase
    .from("health_notes")
    .insert(rest)
    .select("*")
    .single();
  if (error) return err(error.message, 400);
  return json({ note: data });
}
