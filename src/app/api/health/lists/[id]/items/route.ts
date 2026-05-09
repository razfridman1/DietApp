import { z } from "zod";
import { requireUser } from "@/lib/supabase/server";
import { err, json, readBody } from "@/lib/api-helpers";

const PostSchema = z.object({
  name: z.string().min(1).max(120),
  qty: z.string().max(60).nullable().optional(),
  rating: z.number().int().min(1).max(10).nullable().optional(),
  reason: z.string().max(400).nullable().optional(),
  notes: z.string().max(400).nullable().optional(),
  color: z.string().max(20).nullable().optional(),
  category: z.string().max(40).nullable().optional(),
});

export async function POST(
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
  const body = await readBody(req, PostSchema);
  if (body instanceof Response) return body;
  const { user, supabase } = session;

  // ensure list belongs to user
  const { data: list } = await supabase
    .from("weekly_lists")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!list) return err("not_found", 404);

  const { count } = await supabase
    .from("list_items")
    .select("id", { count: "exact", head: true })
    .eq("list_id", id);

  const { data, error } = await supabase
    .from("list_items")
    .insert({
      list_id: id,
      user_id: user.id,
      name: body.name,
      qty: body.qty ?? null,
      rating: body.rating ?? null,
      reason: body.reason ?? null,
      notes: body.notes ?? null,
      color: body.color ?? null,
      category: body.category ?? null,
      position: count ?? 0,
    })
    .select("*")
    .single();
  if (error) return err(error.message, 400);
  return json({ item: data });
}
