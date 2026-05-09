import { z } from "zod";
import { requireUser } from "@/lib/supabase/server";
import { err, json, readBody } from "@/lib/api-helpers";

const PatchSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  qty: z.string().max(60).nullable().optional(),
  rating: z.number().int().min(1).max(10).nullable().optional(),
  reason: z.string().max(400).nullable().optional(),
  notes: z.string().max(400).nullable().optional(),
  color: z.string().max(20).nullable().optional(),
  category: z.string().max(40).nullable().optional(),
  checked: z.boolean().optional(),
  position: z.number().int().min(0).optional(),
});

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ itemId: string }> },
) {
  let session;
  try {
    session = await requireUser();
  } catch (r) {
    return r as Response;
  }
  const { itemId } = await ctx.params;
  const body = await readBody(req, PatchSchema);
  if (body instanceof Response) return body;
  const { user, supabase } = session;
  const { data, error } = await supabase
    .from("list_items")
    .update(body)
    .eq("id", itemId)
    .eq("user_id", user.id)
    .select("*")
    .single();
  if (error) return err(error.message, 400);
  return json({ item: data });
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ itemId: string }> },
) {
  let session;
  try {
    session = await requireUser();
  } catch (r) {
    return r as Response;
  }
  const { itemId } = await ctx.params;
  const { user, supabase } = session;
  const { error } = await supabase
    .from("list_items")
    .delete()
    .eq("id", itemId)
    .eq("user_id", user.id);
  if (error) return err(error.message, 400);
  return json({ ok: true });
}

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ itemId: string }> },
) {
  // Duplicate within the same list
  let session;
  try {
    session = await requireUser();
  } catch (r) {
    return r as Response;
  }
  const { itemId } = await ctx.params;
  const { user, supabase } = session;

  const { data: original, error: gErr } = await supabase
    .from("list_items")
    .select("*")
    .eq("id", itemId)
    .eq("user_id", user.id)
    .single();
  if (gErr || !original) return err("not_found", 404);

  const { id: _id, created_at: _c, position: _p, ...rest } = original;
  const { count } = await supabase
    .from("list_items")
    .select("id", { count: "exact", head: true })
    .eq("list_id", original.list_id);

  const { data, error } = await supabase
    .from("list_items")
    .insert({ ...rest, position: count ?? 0 })
    .select("*")
    .single();
  if (error) return err(error.message, 400);
  return json({ item: data });
}
