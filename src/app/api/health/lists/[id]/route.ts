import { z } from "zod";
import { requireUser } from "@/lib/supabase/server";
import { err, json, readBody } from "@/lib/api-helpers";

const PatchSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  list_type: z
    .enum(["shopping", "weekly", "meal_prep", "recommended", "avoid"])
    .optional(),
  notes: z.string().max(400).nullable().optional(),
  color: z.string().max(20).nullable().optional(),
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
    .from("weekly_lists")
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("*")
    .single();
  if (error) return err(error.message, 400);
  return json({ list: data });
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
    .from("weekly_lists")
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
    .from("weekly_lists")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (gErr || !original) return err("not_found", 404);

  const { data: items } = await supabase
    .from("list_items")
    .select("*")
    .eq("list_id", id)
    .eq("user_id", user.id)
    .order("position", { ascending: true });

  const { data: copy, error: cErr } = await supabase
    .from("weekly_lists")
    .insert({
      user_id: user.id,
      name: `${original.name} ✦`,
      list_type: original.list_type,
      preset: original.preset,
      notes: original.notes,
      color: original.color,
    })
    .select("*")
    .single();
  if (cErr || !copy) return err(cErr?.message ?? "copy_failed", 400);

  if (items && items.length) {
    const rows = items.map((it: any) => ({
      list_id: copy.id,
      user_id: user.id,
      name: it.name,
      qty: it.qty,
      rating: it.rating,
      reason: it.reason,
      notes: it.notes,
      color: it.color,
      category: it.category,
      checked: false,
      position: it.position,
    }));
    await supabase.from("list_items").insert(rows);
  }

  return json({ list: copy });
}
