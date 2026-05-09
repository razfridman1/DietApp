import { z } from "zod";
import { requireUser } from "@/lib/supabase/server";
import { err, json, readBody } from "@/lib/api-helpers";

const PostSchema = z.object({
  name: z.string().min(1).max(80),
  list_type: z
    .enum(["shopping", "weekly", "meal_prep", "recommended", "avoid"])
    .default("shopping"),
  preset: z.string().max(40).nullable().optional(),
  notes: z.string().max(400).nullable().optional(),
  color: z.string().max(20).nullable().optional(),
});

export async function GET() {
  let session;
  try {
    session = await requireUser();
  } catch (r) {
    return r as Response;
  }
  const { user, supabase } = session;
  const { data: lists } = await supabase
    .from("weekly_lists")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const ids = (lists ?? []).map((l: { id: string }) => l.id);
  const { data: items } = ids.length
    ? await supabase
        .from("list_items")
        .select("*")
        .eq("user_id", user.id)
        .in("list_id", ids)
        .order("position", { ascending: true })
    : { data: [] as any[] };

  const grouped: Record<string, any[]> = {};
  for (const it of items ?? []) {
    grouped[it.list_id] ??= [];
    grouped[it.list_id].push(it);
  }
  return json({
    lists: (lists ?? []).map((l: any) => ({ ...l, items: grouped[l.id] ?? [] })),
  });
}

export async function POST(req: Request) {
  let session;
  try {
    session = await requireUser();
  } catch (r) {
    return r as Response;
  }
  const body = await readBody(req, PostSchema);
  if (body instanceof Response) return body;
  const { user, supabase } = session;

  const { data, error } = await supabase
    .from("weekly_lists")
    .insert({
      user_id: user.id,
      name: body.name,
      list_type: body.list_type,
      preset: body.preset ?? null,
      notes: body.notes ?? null,
      color: body.color ?? null,
    })
    .select("*")
    .single();
  if (error) return err(error.message, 400);
  return json({ list: { ...data, items: [] } });
}
