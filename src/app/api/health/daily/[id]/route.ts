import { z } from "zod";
import { requireUser } from "@/lib/supabase/server";
import { err, json, readBody } from "@/lib/api-helpers";

const PatchSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  kind: z.enum(["food", "drink"]).optional(),
  qty_value: z.number().nullable().optional(),
  qty_unit: z.enum(["g", "ml", "unit"]).optional(),
  rating: z.number().int().min(1).max(10).nullable().optional(),
  notes: z.string().max(400).nullable().optional(),
  color: z.string().max(20).nullable().optional(),
  category: z.string().max(40).nullable().optional(),
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
    .from("daily_intake")
    .update(body)
    .eq("id", id)
    .eq("user_id", user.id)
    .select("*")
    .single();
  if (error) return err(error.message, 400);
  return json({ item: data });
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
    .from("daily_intake")
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
  // Duplicate an existing item.
  let session;
  try {
    session = await requireUser();
  } catch (r) {
    return r as Response;
  }
  const { id } = await ctx.params;
  const { user, supabase } = session;

  const { data: original, error: getErr } = await supabase
    .from("daily_intake")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (getErr || !original) return err("not_found", 404);

  const { id: _id, created_at: _c, consumed_at: _ca, ...rest } = original;
  const { data, error } = await supabase
    .from("daily_intake")
    .insert({ ...rest, consumed_at: new Date().toISOString() })
    .select("*")
    .single();
  if (error) return err(error.message, 400);
  return json({ item: data });
}
